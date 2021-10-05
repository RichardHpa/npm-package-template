const fs = require('fs')
const { spawn } = require('child_process')

const validPackageName =
	/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

const styles = {
	success: { open: '\u001b[32;1m', close: '\u001b[0m' },
	danger: { open: '\u001b[31;1m', close: '\u001b[0m' },
	info: { open: '\u001b[36;1m', close: '\u001b[0m' },
	subtitle: { open: '\u001b[2;1m', close: '\u001b[0m' },
}
function color(modifier, string) {
	return styles[modifier].open + string + styles[modifier].close
}

let questionNum = 0
const questions = [
	{ question: 'What is your name?', answer: null, required: true },
	{ question: 'What is your package name?', answer: null, required: true },
	{ question: 'Enter a small description', answer: null, required: false },
]

let deletedFiles = 0
// remove createdFiles
let createdFiles = 0
const files = [
	'./test.js',
	'./test-package-lock.json',
	'./playground/test-package-lock.json',
]

// Remove this once finished
function createFilesForTest(i) {
	// runNpmInstall()
	console.log(color('subtitle', '▶️  The file has been saved!'))
	fs.writeFile(files[i], 'Hello Node.js', (err) => {
		if (err) throw err
		console.log(color('subtitle', '▶️  The file has been saved!'))
		createdFiles++
		if (createdFiles === files.length) {
			askQuestion(0)
		} else {
			createFilesForTest(createdFiles)
		}
	})
}

function askQuestion(i) {
	process.stdout.write(`${questions[i].question}\n`)
}
console.clear()

console.log(color('info', '▶️  Starting app setup...\n'))
// askQuestion(questionNum)

// console.log(color('subtitle', '▶️  Creating Files for Testing\n'))
createFilesForTest(0)

// Ask the Questions
process.stdin.on('data', function (answer) {
	const inputAnswer = answer.toString().trim()
	if (inputAnswer) {
		if (questionNum === 1) {
			if (!validPackageName.test(inputAnswer)) {
				console.log(color('danger', 'Invalid Package name, please try again'))
				askQuestion(questionNum)
				return
			}
		}
		questions[questionNum].answer = inputAnswer
	} else if (inputAnswer.length === 0 && questions[questionNum].required) {
		console.log(color('danger', 'This question is required.'))
		askQuestion(questionNum)
		return
	}
	questionNum++
	if (questionNum === questions.length) {
		console.log(color('info', '▶️  Removing files'))
		deleteFiles(deletedFiles)
	} else {
		askQuestion(questionNum)
	}
})

function deleteFiles(i) {
	fs.unlink(files[i], function (err) {
		if (err) {
			console.log(color('subtitle', `▶️  Cant find ${files[i]}`))
		} else {
			console.log(color('success', `▶️  Removed ${files[i]}`))
		}
		deletedFiles++
		if (deletedFiles === files.length) {
			console.log(color('success', `▶️  Files Successfully Removed`))
			editReadme()
		} else {
			deleteFiles(deletedFiles)
		}
	})
}

function editReadme() {
	console.log(color('info', '▶️  Editing Files...\n'))
	fs.readFile('./scripts/README.template.md', 'utf8', function (err, data) {
		if (err) {
			return console.log(err)
		}
		var result = data.replace(/# package-name/g, `# ${questions[1].answer}`)

		fs.writeFile('./README.md', result, 'utf8', function (err) {
			if (err) return console.log(err)
			process.exit()
		})
	})
}

function runNpmInstall() {
	const npm = spawn('npm', ['install'], { cwd: './' })
	npm.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`)
	})
	npm.stderr.on('data', (data) => {
		console.log(color('danger', data))
	})
	npm.on('close', (code) => {
		console.log(`child process exited with code ${code}`)
		console.log(color('success', '▶️  Successfully installed packages\n'))
		process.exit()
	})
}

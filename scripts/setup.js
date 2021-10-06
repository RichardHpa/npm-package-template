const fs = require('fs')
const { spawn } = require('child_process')
const { name, description, author } = require('../package.json')

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
	{ question: 'What is your name?', answer: '', required: true },
	{ question: 'What is your package name?', answer: '', required: true },
	{ question: 'Enter a small description', answer: '', required: false },
]

let deletedFiles = 0
// Remove this once finished with developing
let createdFiles = 0

const filesToCreateForTest = [
	'./README.md',
	'./package-lock.json',
	'./playground/package-lock.json',
	//remove these
	'./package.json',
	'./playground/package.json',
]
const files = [
	'./README.md',
	'./package-lock.json',
	'./playground/package-lock.json',
]

// Remove this once finished with developing
function createTestString(strToSearch, strToFind, strToInsert) {
	var n = strToSearch.lastIndexOf(strToFind)
	if (n < 0) return strToSearch
	return strToSearch.substring(0, n) + strToInsert + strToSearch.substring(n)
}

// Remove this once finished with developing
function createFilesForTest(i) {
	if (i === 0) {
		console.log(color('info', '▶️  Creating Files for Testing'))
	}
	// fs.copyFile(files[i], createTestString(files[i], '.', '.test'), (err) => {
	// 	if (err) throw err
	// 	console.log(
	// 		color(
	// 			'subtitle',
	// 			`▶️  ${createTestString(files[i], '.', '.test')} has been saved!`
	// 		)
	// 	)
	// 	createdFiles++
	// 	if (createdFiles === files.length) {
	// 		askQuestion(0)
	// 	} else {
	// 		createFilesForTest(createdFiles)
	// 	}
	// })
	fs.copyFile(
		filesToCreateForTest[i],
		createTestString(filesToCreateForTest[i], '.', '.test'),
		(err) => {
			if (err) throw err
			console.log(
				color(
					'subtitle',
					`▶️  ${createTestString(
						filesToCreateForTest[i],
						'.',
						'.test'
					)} has been saved!`
				)
			)
			createdFiles++
			if (createdFiles === filesToCreateForTest.length) {
				askQuestion(0)
			} else {
				createFilesForTest(createdFiles)
			}
		}
	)
}

function askQuestion(i) {
	process.stdout.write(`${questions[i].question}\n`)
}

console.clear()
console.log(color('info', '▶️  Starting app setup...\n'))
// askQuestion(questionNum)
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
	// fs.unlink(files[i], function (err) {
	fs.unlink(createTestString(files[i], '.', '.test'), function (err) {
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
	console.log(color('info', '▶️  Editing README File...\n'))
	fs.readFile('./scripts/README.template.md', 'utf8', function (err, data) {
		if (err) {
			return console.log(err)
		}

		let replaceText = data.replace(name, `${questions[1].answer}`)
		replaceText = replaceText.replace(description, `${questions[2].answer}`)

		// fs.writeFile('./README.md', replaceText, 'utf8', function (err) {
		fs.writeFile('./README.test.md', replaceText, 'utf8', function (err) {
			if (err) return console.log(err)
			editPackageJson(0)
		})
	})
}

const packagesJsonFiles = [
	'./package.test.json',
	'./playground/package.test.json',
]
let packagesJsonFilesEdited = 0
// const packagesJsonFiles =['./package.json', './playground/package.test.json']
function editPackageJson(fileNum) {
	console.log(color('info', '▶️  Editing Package.json File...\n'))
	fs.readFile(packagesJsonFiles[fileNum], 'utf8', function (err, data) {
		// fs.readFile('./package.json', 'utf8', function (err, data) {
		if (err) {
			return console.log(err)
		}
		let replaceText = data.replace(name, `${questions[1].answer}`)
		replaceText = replaceText.replace(description, `${questions[2].answer}`)
		replaceText = replaceText.replace(author, `${questions[0].answer}`)

		// fs.writeFile('./README.md', replaceText, 'utf8', function (err) {
		fs.writeFile(
			packagesJsonFiles[fileNum],
			replaceText,
			'utf8',
			function (err) {
				if (err) return console.log(err)
				packagesJsonFilesEdited++
				if (packagesJsonFilesEdited === packagesJsonFiles.length) {
					console.log(
						color('success', `▶️  Files Successfully Edited Packages`)
					)
					process.exit()
				} else {
					editPackageJson(packagesJsonFilesEdited)
				}
			}
		)
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

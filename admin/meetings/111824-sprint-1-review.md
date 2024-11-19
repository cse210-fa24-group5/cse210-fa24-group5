### Attendance: 
- Everyone was present either in-person in chez-bob or remote in google meet

### Things we accomplished this sprint: 
- Implemented ESLint code checking in Github Actions on every single PR to our dev branch and main
- equirement for a single reviewer for each PR that gets merged to dev, and 3 reviewers to merge from dev to the main branch
- Integration and unit testing w/ Jest
- Github actions file for jest calls all .test.js files in the repo, which includes basic unit tests as well as end-to-end/integration tests using puppeteer
- Implemented auto documentation generation with JSDoc, happens on every merge to the dev branch
- Github Actions that generates .zip file for our deployable extension, happens on every push of new tag, builds from ./src in the dev branch

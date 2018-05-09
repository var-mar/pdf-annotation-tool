
# Annotation PDF tool

## Description:

The tool wants to be a tool to create metadata annotations to PDF for open data sets.

## Table of functionalities build in the tool

- Login system base on Passport (https://www.npmjs.com/package/passport)
- Upload pdf
- Visualize pdf using PDF.js and create annotations using library react-pdf-annotator.
 metadata PDF in information page
- Visualize metadata PDF in information page
- Create Visualization thumbnail annotations made. Colors rectangles are

## Screenshot Tool
![Homepage](https://github.com/var-mar/pdf-annotation-tool/raw/master/screenshots/Screenshot1.png)
![Dashboard](https://github.com/var-mar/pdf-annotation-tool/raw/master/screenshots/Screenshot2.png)
![Pdf annotation page](https://github.com/var-mar/pdf-annotation-tool/raw/master/screenshots/Screenshot3.png)

## Todo list

Tool now is in prototype state. To be a ready tool need more work:
- [Clean code]
- [Test and debug application]
- [Create Legend(now is add manually to the database)]
- [Retriving pdf list in dashboard seems goes to slow. Maybe sending too much data not necessary]
- [Create comments to existing comments] (suggest in the workshop)
- [Create multi selection to annotation types] (suggest in the github issue)
- [Fix image annotations of the pdf]
- [Fix edit annotations already created]
- [Add in pdf information all annotation activity data (log of:created annotations, modified, delete). Restore delete messages or modified to certain previous state]

## Prior art and Installation Dependencies

The project was created using create-react-app (https://github.com/facebook/create-react-app). And it has been using the react-pdf-annotation library as base code: https://github.com/agentcooper/react-pdf-annotator .

Install all dependencies before running scripts with following:

```sh
npm install
```

## Important available Scripts

In the project directory, you can run:

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](#deployment) for more information.

### `node server/index.js`

Start express node.js app. The app require mongodb service running.

## Folder Structure

src/ -> content the react app
server/ -> content the node.js express server app
svgThumbnails/ -> Folder where the svg thumnails visualization are store
pdfUpload/ -> Folder where the pdf are upload

For the project to build, **these files must exist with exact filenames**:

* `public/index.html` is the page template;
* `src/index.js` is the JavaScript entry point.

## Sending Feedback

We are always open to [your feedback](https://github.com/var-mar/pdf-annotation-tool/issues).

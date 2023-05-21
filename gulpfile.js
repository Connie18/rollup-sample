const gulp = require("gulp");
const tsMorph = require("ts-morph");
const fs = require("fs");
const path = require("path");

// This function will recursively get the file paths of the imports
const resolveImports = (project, filePath, filePaths = []) => {
  // Skip if the file has already been processed
  if (filePaths.includes(filePath)) {
    return filePaths;
  }

  const sourceFile = project.addSourceFileAtPath(filePath);

  sourceFile.getImportDeclarations().forEach((importDeclaration) => {
    const importFilePath = path.join(
      path.dirname(filePath),
      importDeclaration.getModuleSpecifierValue() + ".ts"
    );
    resolveImports(project, importFilePath, filePaths);
  });

  // Push the file path into the list after processing its imports
  filePaths.push(filePath);

  return filePaths;
};

// Configuration object
const config = {
  tsConfigFilePath: "tsconfig.json",
  entryFilePath: ["src/index.ts", "src/components/Car.ts"],
  outputDir: "dist",
};

// This is the main Gulp task
const concatTS = function (done) {
  // Iterate over each entry file
  config.entryFilePath.forEach((entryFilePath) => {
    const project = new tsMorph.Project({
      tsConfigFilePath: config.tsConfigFilePath,
    });

    let outputText = "";

    // Recursively resolve the imports starting from the entry file
    const inputFilePaths = resolveImports(project, entryFilePath);

    // Iterate over the files to be concatenated
    for (const inputFilePath of inputFilePaths) {
      const sourceFile = project.getSourceFile(inputFilePath);

      // Remove all import declarations
      sourceFile.getImportDeclarations().forEach((id) => id.remove());

      // Remove 'export' keyword from classes, functions, variables etc.
      sourceFile.getClasses().forEach((c) => c.setIsExported(false));

      // Save the updated source file text in memory
      outputText += sourceFile.getFullText() + "\n";
    }

    const outputFileTS = path.join(
      config.outputDir,
      path.basename(entryFilePath)
    );

    // Write the concatenated TypeScript code to the output file
    fs.writeFileSync(outputFileTS, outputText);

    // Transpile the TypeScript code to JavaScript
    const outputJS = tsMorph.ts.transpileModule(outputText, {
      compilerOptions: project.getCompilerOptions(),
    });

    const outputFileJS = outputFileTS.replace(".ts", ".js");

    // Write the transpiled JavaScript code to the output file
    fs.writeFileSync(outputFileJS, outputJS.outputText);
  });

  done();
};

gulp.task("concatTS", concatTS);

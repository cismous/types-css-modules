// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

let processList: ChildProcessWithoutNullStreams[] = [];

export function exit() {
  for (const process of processList) {
    process.kill("SIGHUP");
  }
  processList = [];
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("TypedCssModules");
  output.append("Congratulations, Typed CSS Modules has been initialized!\n\n");

  function compile(path: string) {
    const cmd = spawn("deno", [
      "run",
      "-A",
      `${context.extensionPath}/out/main.js`,
      path,
    ]);
    // output.append(`${context.extensionPath}/out/main.js ${path}`);
    cmd.stdout.on("data", (data: any) => {
      var textChunk = data.toString();
      output.append(textChunk);
    });
    cmd.stderr.on("data", (data: any) => {
      output.append(data);
    });
    return cmd;
  }

  if (vscode.workspace.workspaceFolders?.length) {
    for (const item of vscode.workspace.workspaceFolders) {
      const process = compile(item.uri.path);
      processList.push(process);
    }
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "typed-css-modules.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from typed-css-modules!"
      );
    }
  );

  // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  exit();
}

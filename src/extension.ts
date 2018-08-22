'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const FASTLANE_MODE: vscode.DocumentFilter = { language: 'ruby', scheme: 'file' };

export interface LaneDefinitionInformation {
	file: string;
	line: number;
	column: number;
}

export function definitionLocation(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): LaneDefinitionInformation {

    let wordRange = document.getWordRangeAtPosition(position);
	//let lineText = document.lineAt(position.line).text;
    let lane = wordRange ? document.getText(wordRange) : '';

    let allText = document.getText();
//    let offset = allText.indexOf("lane :" + word + " ");
    let offset = allText.search("/lane\s+:"+lane+"\s+do/g");
    if (offset === -1)
    {
        let definitionInformation: LaneDefinitionInformation = {
            file: "",
            line: 0,
            column: 0};

        return definitionInformation;
    }


    let lanePosition = document.positionAt(offset);

    let definitionInformation: LaneDefinitionInformation = {
        file: document.fileName,
        line: lanePosition.line,
        column: lanePosition.character
    };

    return definitionInformation;
}

class LanesDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):vscode.Location {
        var definitionInfo = definitionLocation(document, position, token);
        if (definitionInfo === null || definitionInfo.file === null) { 
            return new vscode.Location(document.uri, position);
        }

        let definitionResource = vscode.Uri.file(definitionInfo.file);
        let pos = new vscode.Position(definitionInfo.line, definitionInfo.column);
        return new vscode.Location(definitionResource, pos);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "lanes-navigator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.languages.registerDefinitionProvider(FASTLANE_MODE, new LanesDefinitionProvider()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
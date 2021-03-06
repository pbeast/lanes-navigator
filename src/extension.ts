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
    let r = new RegExp("lane\\s+:"+lane+"\\s+do", "g")
    let offset = allText.search(r);
    if (offset === -1)
    {
        r = new RegExp("def\\s+"+lane+"\\s*\\(", "g")
        offset = allText.search(r);
        if (offset === -1){
            let definitionInformation: LaneDefinitionInformation = {
                file: "",
                line: 0,
                column: 0};

            return definitionInformation;
        }
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
        if (definitionInfo === null || definitionInfo.file === null || definitionInfo.file === "") { 
            return new vscode.Location(document.uri, position);
        }

        let definitionResource = vscode.Uri.file(definitionInfo.file);
        let pos = new vscode.Position(definitionInfo.line, definitionInfo.column);
        return new vscode.Location(definitionResource, pos);
    }
}

export class FastlaneSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {

        let allText = document.getText();
        let r = new RegExp("lane\\s+:(\\w+)\\s+do", "g")
        

        let symbols = []

        let match;
        do {
            match = r.exec(allText);
            if (match) {
                symbols.push(new vscode.SymbolInformation(match[1], vscode.SymbolKind.Method, "", new vscode.Location(document.uri, document.positionAt(r.lastIndex))));
            }
        } while (match);

        r = new RegExp("def\\s+(\\w+)\\s*\\(", "g")

        do {
            match = r.exec(allText);
            if (match) {
                symbols.push(new vscode.SymbolInformation(match[1], vscode.SymbolKind.Function, "", new vscode.Location(document.uri, document.positionAt(r.lastIndex))));
            }
        } while (match);

        return symbols;
    }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(FASTLANE_MODE, new LanesDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(FASTLANE_MODE, new FastlaneSymbolProvider()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
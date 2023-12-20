const readline = require('readline');
const fs = require('fs');

async function start() {

    // create an interface for reading from the terminal
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const tableName = await ask(rl, 'What is the table name? ');
    let finished = false;
    const params = [];
    while (!finished) {
        const paramName = await ask(rl, 'Type the name of the table field (or type "done" to finish): ');
        if (paramName === 'done') {
            finished = true;
        } else {
            params.push(paramName);
        }
    }

    // Read the contents of the template file
    const template = fs.readFileSync('./src/Models/DBModels/template.js', 'utf8');

    const paramList = params.length ? ', '+params.join(', ') : '';
    const paramInsertPlaceholder = params.length ? ', '+params.map(param => '?').join(', ') : '';
    const paramAssignment = params.map(param => `this.${param} = ${param};`).join('\n\t\t');

    // Substitute the adjustable parameters in the template with the desired values
    let output = template.replaceAll('$TABLE_NAME', tableName)
                        .replaceAll('$PARAM_LIST', paramList)
                        .replaceAll('$PARAM_INSERT_PLACEHOLDER', paramInsertPlaceholder)
                        .replaceAll('$PARAM_ASSIGNMENT', paramAssignment);

    // Write the resulting content to a new JavaScript file
    fs.writeFileSync(`./src/Models/DBModels/${tableName}.js`, output);

    rl.close();

}

const ask = async (rl, question) => {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

start();
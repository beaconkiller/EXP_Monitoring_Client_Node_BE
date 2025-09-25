const fs = require('fs');
const repoHelperV2 = require('./repo.helperV2');
const { exec } = require('child_process');


class Repo_Command {

    exec_command(data) {
        repoHelperV2.c_log('exec_command(data)', true);

        if (data == 'get_storage') {
            this.get_storage();
        }
    }


    async get_storage() {
        exec('dir', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
            }
            console.log(`${stdout}`);
        });
    }

}

module.exports = new Repo_Command();

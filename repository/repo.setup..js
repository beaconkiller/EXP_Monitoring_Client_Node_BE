const fs = require('fs');
const repoHelperV2 = require('./repo.helperV2');
const { exec } = require('child_process');
const path = require('path');


class Repo_Setup {


    init_setup() {

        repoHelperV2.c_log('RUNNING SETUP', true);

        this.check_file_settings();
    };


    check_file_settings() {
        let filepath = path.join(__dirname, '..', 'client_settings.json');
        let bool_check = fs.existsSync(filepath);

        if (!bool_check) {
            console.log('client_settings.json not found, creating a new one.');
            console.log('CUSTOMIZE THE FILE LATER, MANDATORY.');
            this.create_settings_file()
        }
    }



    create_settings_file() {
        let newObj = {
            "client_id": "102.321.323.12",
            "target_ws_host": "ws://localhost:4099"
        }

        let filepath = path.join(__dirname, '..', 'client_settings.json');
        fs.writeFileSync(filepath, JSON.stringify(newObj, null, 2), 'utf8');
    }




}

module.exports = new Repo_Setup();

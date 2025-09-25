const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const repoCommand = require('./repo.command.');
const repoHelperV2 = require('./repo.helperV2');

class Repo_WS {


    socket = null;
    client_settings = null;


    async initialize() {
        try {

            repoHelperV2.c_log('INITIALIZING WEBSOCKET CONNECTION', true);

            this.read_settings_json();

            console.log(this.client_settings);
            console.log(' ');

            this.connect_ws();

            this.socket.on('open', () => {
                console.log('Connected to server');

                this.socket.send(JSON.stringify({
                    type: 'register',
                    deviceId: this.client_settings['client_id'],
                }));
            });

            this.socket.on('message', (data) => {
                this.handle_message(data);
            });

            this.socket.on('close', () => {
                this.reconnect_ws();
            });

            this.socket.on('error', (err) => {
                console.error('Error:', err.message);
            });

        } catch (error) {
            console.error(error);
        }
    }


    connect_ws() {
        // console.log('========= connect_ws() =========');
        this.socket = new WebSocket(this.client_settings['target_ws_host']);
    }


    async reconnect_ws() {
        console.log('reconnecting...');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        this.initialize();
    }



    handle_message(data) {
        repoCommand.exec_command(data);
    }



    read_settings_json() {
        // console.log('================ this.read_settings_json() ================');
        // console.log(' ');

        let file_path = path.join(__dirname, '..', 'client_settings.json');
        let fileContent = fs.readFileSync(file_path, { encoding: 'utf8' });
        let file = JSON.parse(fileContent);

        this.client_settings = file;

        // console.log(' ');
    };



    getter_client_settings() {
        return this.client_settings;
    }
}

module.exports = new Repo_WS();

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const repoHelperV2 = require('./repo.helperV2');
const { exec } = require('child_process');
const repoCommand = require('./repo.command');
const repoGlobal = require('./repo.global');

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

                repoGlobal.setter_target_socket(this.socket);
                repoCommand.init_loop();
            });

            this.socket.on('message', (data) => {
                this.handle_message(data);
            });

            this.socket.on('close', () => {
                this.socket = null;
                this.reconnect_ws();
            });

            this.socket.on('error', (err) => {
                console.error('Error:', err.message);
            });

        } catch (error) {
            this.socket = null;
            repoGlobal.setter_target_socket(null);

            this.reconnect_ws();
        }
    }


    connect_ws() {
        // console.log('========= connect_ws() =========');
        this.socket = new WebSocket(this.client_settings['target_ws_host']);
        repoGlobal.setter_target_socket(this.socket);
    }


    async reconnect_ws() {
        while (this.socket == null) {
            console.log('reconnecting...');
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });

            this.initialize();
        }
    }



    handle_message(data) {
        this.exec_command(data);
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



    send_message(type, message, client) {
        console.log('======== send_message() =========');
        this.socket.send(JSON.stringify({
            type: type,
            payload: message
        }));
    }



    exec_command(data) {
        repoHelperV2.c_log('GOT COMMAND', true);

        data = JSON.parse(data);
        let type = data['type']

        if (type == 'get_storage') {
            this.get_storage();
        }
    }



    async get_storage() {
        repoHelperV2.c_log('get_storage()', true);

        const res = await new Promise((resolve, reject) => {
            // exec('DIR', (error, stdout, stderr) => {
            exec('df -kh', (error, stdout, stderr) => {
                if (error) return reject(error);
                if (stderr) return reject(stderr);
                resolve(stdout);
            });
        });

        console.log(res);

        this.send_message('give_storage', res, 'HOST_21');
    }

}

module.exports = new Repo_WS();

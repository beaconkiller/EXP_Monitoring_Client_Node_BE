const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const repoCommand = require('./repo.command');
const repoHelperV2 = require('./repo.helperV2');
const { exec } = require('child_process');

class Repo_Global {

    target_socket = null;
    host_socket = 'HOST_21';

    setter_target_socket(target_socket) {
        this.target_socket = target_socket;
    }


    getter_target_socket() {
        return this.target_socket;
    }

}

module.exports = new Repo_Global();

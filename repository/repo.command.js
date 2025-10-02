const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const repoCommand = require('./repo.command');
const repoHelperV2 = require('./repo.helperV2');
const { exec } = require('child_process');
const os = require('os');
const repoGlobal = require('./repo.global');

class Repo_Command {

    interval_loop = 3000;

    async init_loop() {
        repoHelperV2.c_log('init_loop()');

        let target_socket = repoGlobal.getter_target_socket();

        if (target_socket == null) {
            return;
        }

        while (true) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, this.interval_loop);
            })



            if (target_socket) {
                this.send_message(
                    'server_info',
                    await this.get_server_usage(),
                    repoGlobal.host_socket,
                )
            }

        }
    }



    send_message(type, message, client) {
        // console.log('======== send_message() =========');
        repoGlobal.target_socket.send(JSON.stringify({
            type: type,
            payload: message,
        }));
    }



    async get_server_usage() {
        return JSON.stringify({
            mem: this.get_memory_usage(),
            cpu: await this.get_cpu_usage(),
            uptime: this.get_uptime(),
        })
    }


    get_memory_usage() {
        let ram_total = (os.totalmem() / 1024 / 1024).toFixed(2);
        let ram_free = (os.freemem() / 1024 / 1024).toFixed(2);
        let ram_usage = ram_total - ram_free;

        let newObj = {
            ram_total: parseFloat(ram_total),
            ram_usage: parseFloat(ram_usage),
            ram_free: parseFloat(ram_free),
        }

        return newObj;
    }

    async get_cpu_usage() {
        let x = await new Promise((resolve, reject) => {
            exec("COLUMNS=300 top -bn1 | grep '%Cpu(s)'", (err, stdout) => {
                if (err) return reject(err);

                // Example stdout: "%Cpu(s):  5.3 us,  1.2 sy,  0.0 ni, 93.0 id,  0.2 wa,  0.0 hi,  0.3 si,  0.0 st"
                const match = stdout.match(/(\d+\.\d+)\s*id/);
                if (match) {
                    const idle = parseFloat(match[1]);
                    const usage = 100 - idle; // total CPU usage %
                    resolve(parseFloat(usage.toFixed(1)));
                } else {
                    reject(null);
                }
            });
        });

        let newObj = {
            cpu_usage: x,
        }

        return newObj;
    }



    get_uptime() {
        let up_time = os.uptime();

        const days = Math.floor(up_time / (3600 * 24));
        const hours = Math.floor((up_time % (3600 * 24)) / 3600);
        const minutes = Math.floor((up_time % 3600) / 60);
        const secs = Math.floor(up_time % 60);
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    }



    async get_installed_db() {
        repoHelperV2.c_log('get_installed_db()', true);

        let x = await new Promise((resolve, reject) => {
            exec("systemctl list-units --type=service | grep -E 'mysql|mariadb|postgresql|mongodb|redis'", (err, stdout) => {
                if (err) return reject(err);

                resolve(stdout);

            });
        });

        console.log(x);
    };
};


module.exports = new Repo_Command();

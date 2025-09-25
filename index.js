var db_sitemap = require('./services/db_sitemap');
const conf_e_approve = require('./config/database')
const webServer = require('./services/web-server');
const moment = require('moment');
const path = require('path');
const os = require('os');
const websocket = require('./repository/repo.ws');
const repoSetup = require('./repository/repo.setup.');



async function startup() {

    // ----------------------------------------
    // ------------ SET GLOBAL VAR ------------
    // ----------------------------------------

    setGlobalVariable();
    repoSetup.init_setup();



    // ----------------------------------------
    // ------------ WEBSOCKET INIT ------------
    // ----------------------------------------

    try {
        websocket.initialize()
    } catch (err) {
        console.error(`${err}`);
        process.exit(1); // Non-zero failure code
    }


    // ----------------------------------------
    // -------------- WEB-SERVER --------------
    // ----------------------------------------

    // try {
    //     console.log('Initializing web server module');

    //     await webServer.initialize();
    // } catch (err) {
    //     console.error(`${err}`);
    //     process.exit(1); // Non-zero failure code
    // }



    // ===========================================
    // ================= DEBUG ===================
    // ===========================================

    // excel_inp.excel_read();

}

async function shutdown(e) {
    try {
        console.log('Closing db_e_approve');
        await db_e_approve.close()
        console.log('db_e_approve closed');
    } catch (error) {
        console.error(error);
    }
}



async function setGlobalVariable() {
    global.app_name = 'test admin';
    global.base_dir = __dirname;
    global.dir_sitemap = path.join(__dirname, 'file_storage', 'file_sitemap');
    global.dir_controllers = path.join(__dirname, 'controllers');
}




startup();
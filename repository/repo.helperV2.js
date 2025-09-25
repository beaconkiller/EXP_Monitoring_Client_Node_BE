const fs = require('fs');
const path = require('path');

class HelperV2 {

    file_upload = async (file_name, base64_data, path_to) => {
        console.log("\n ========= file_upload ========= \n");

        try {
            console.log(file_name);
            console.log(base64_data.length);

            // ---------------------------------------------------------------------------------------------
            // ---------------------------------------------------------------------------------------------
            // ---------------------------------- NOTE TO FUTURE ASS SELF ----------------------------------
            // ---------------------------------------------------------------------------------------------
            // ---- BEFORE WRITING THE FILE TO DISK, SPLIT THE CONVERTED BASE64 STRING BY COMMAS, THEN -----
            // ---- SELECT THE SECOND ELEMENT. CUS THATS THE REAL FILE, THE FIRST ELEMENT IS THE HEADER ---- 
            // ---- DO IT LIKE WE DID BELOW. --------------------------------------------------------------- 
            // ---------------------------------------------------------------------------------------------
            // ---------------------------------------------------------------------------------------------

            let fileData = base64_data.split(',')[1] ?? base64_data;
            const binary_data = Buffer.from(fileData, 'base64')

            // console.log(fileData);

            fs.writeFile(path_to + '/' + file_name, binary_data, function (err) {
                if (err) {
                    console.log(err)
                }
            })

            console.log('---- Upload file success ----');

            return path.join(path_to, file_name);
        } catch (error) {
            console.log('---- Upload file FAILED ----');
            console.log(error);
            return error;
        }
    }



    dir_check_auto_create(filepath) {
        let x = fs.existsSync(filepath);
        if (!x) {
            fs.mkdirSync(filepath, { recursive: true });
        }
    }



    get_file_ext_by_name = (filename) => {
        let arr_name = filename.split('.');
        return arr_name[arr_name.length - 1];
    }



    get_timestamp() {
        return (new Date()).getTime().toString();
    }


    async set_delay(val) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, val);
        })
    }


    get_curr_date() {
        return (new Date()).toISOString().split('.')[0].replaceAll('T', ' ');
    }



    c_log(data, bool) {
        console.log(' ');
        if (bool) {
            console.log(`=========== ${data} ==========`);
        } else {
            console.log(`${data}`);
        }
        console.log(' ');
    }
}

module.exports = new HelperV2();

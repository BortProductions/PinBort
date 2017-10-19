module.exports = {
    effectivelyAllowed: function(user, server, sql, callback) {
        if (user.id === 152559951930327040 || user.id === 256837977169330176) {
            callback(true);
            return;
        }
        if(server.owner.id === user.id){
            callback(true);
            return;
        }
        let check = false;
        server.roles.forEach(function (entry) {
            if (entry.hasPermission('ADMINISTRATOR') || entry.hasPermission('MANAGE_MESSAGES')) {
                entry.members.forEach(function(entry2){
                    if(entry2.id === user.id) {
                        check = true;
                    }
                });
            }
        });
        if(check){
            callback(true);
            return;
        }
        this.rawAllowed(user, server, sql, (isAllowed) => {
            if(isAllowed){
                callback(true);
                return;
            }
            callback(false);
        });
    },
    addAllowed: function(user, server, sql){
        let current = [];
        sql.get(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
            if(row){
                current = row.allowed.split(",");
            }
            current.push(user.id);
            sql.get(`UPDATE serverPerms SET allowed = \'${current.join()}\' WHERE serverId = "${server.id}"`);
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS serverPerms (serverId TEXT, allowed TEXT)").then(() => {
                sql.run(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
                    if(!row) {
                        sql.run(`INSERT INTO serverPerms (serverId, allowed) VALUES (${server.id}, ${[user.id].join()})`);
                    }
                });
            });
        });
    },
    removeAllowed: function(user, server, sql){
        let current;
        sql.get(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
            current = row.allowed.split(",");
            if(current.includes(user.id)){
                current.pop(user.id);
            }
            sql.get(`UPDATE serverPerms SET allowed = \'${current.join()}\' WHERE serverId = "${server.id}"`);
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS serverPerms (serverId TEXT, allowed TEXT)").then(() => {
                sql.run(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
                    if(!row){
                        sql.run(`INSERT INTO serverPerms (serverId, allowed) VALUES (${server.id}, ?)`);
                    }
                });
            });
        });
    },
    rawAllowed: function(user, server, sql, callback) {
        sql.get(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
            if(row) {
                let returnVal = false;
                row.allowed.split(",").forEach(function (entry) {
                    console.log(`Checking ${entry} vs ${user.id}`)
                    if (entry === user.id) {
                        returnVal = true;
                        console.log("Success!")
                    }
                });
                callback(returnVal);
            }
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS serverPerms (serverId TEXT, allowed TEXT)").then(() => {
                sql.run(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
                    if(!row) {
                        sql.run(`INSERT INTO serverPerms (serverId, allowed) VALUES (${server.id}, ?)`);
                    }
                });
            });
            callback(false);
        });
    }
};
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
        sql.get(`SELECT allowed FROM server WHERE serverId = "${server.id}"`).then(row => {
            if(row){
                current = row.allowed.split(",");
            }
            current.push(user.id);
            sql.get(`UPDATE server SET allowed = \'${current.join()}\' WHERE serverId = "${server.id}"`);
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS server (serverId TEXT, allowed TEXT, channel TEXT)").then(() => {
                sql.run(`SELECT allowed FROM server WHERE serverId = "${server.id}"`).then(row => {
                    if(!row) {
                        sql.run(`INSERT INTO server (serverId, allowed, channel) VALUES (${server.id}, ${[user.id].join()}, ?)`);
                    }
                });
            });
        });
    },
    removeAllowed: function(user, server, sql){
        let current;
        sql.get(`SELECT allowed FROM server WHERE serverId = "${server.id}"`).then(row => {
            current = row.allowed.split(",");
            if(current.includes(user.id)){
                current.pop(user.id);
            }
            sql.get(`UPDATE server SET allowed = \'${current.join()}\' WHERE serverId = "${server.id}"`);
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS server (serverId TEXT, allowed TEXT, channel TEXT)").then(() => {
                sql.run(`SELECT allowed FROM server WHERE serverId = "${server.id}"`).then(row => {
                    if(!row){
                        sql.run(`INSERT INTO server (serverId, allowed, channel) VALUES (${server.id}, ?, ?)`);
                    }
                });
            });
        });
    },
    rawAllowed: function(user, server, sql, callback) {
        sql.get(`SELECT allowed FROM server WHERE serverId = "${server.id}"`).then(row => {
            if(row) {
                let returnVal = false;
                row.allowed.split(",").forEach(function (entry) {
                    if (entry === user.id) {
                        returnVal = true;
                    }
                });
                callback(returnVal);
            }
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS server (serverId TEXT, allowed TEXT, channel TEXT)").then(() => {
                sql.run(`SELECT allowed FROM server WHERE serverId = "${server.id}"`).then(row => {
                    if(!row) {
                        sql.run(`INSERT INTO server (serverId, allowed, channel) VALUES (${server.id}, ?, ?)`);
                    }
                });
            });
            callback(false);
        });
    },
    setChannel: function (store, server, sql) {
        sql.get(`SELECT channel FROM server WHERE serverId = "${server.id}"`).then(row => {
            if(row){
                sql.run(`UPDATE server SET channel = \'${store}\' WHERE serverId = "${server.id}"`);
            }
            else {
                sql.run(`INSERT INTO server (serverId, allowed, channel) VALUES (${server.id}, ?, "${store}")`);
            }
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS server (serverId TEXT, allowed TEXT, channel TEXT)").then(() => {
                sql.run(`SELECT * FROM server WHERE serverId = "${server.id}"`).then(row => {
                    if(!row) {
                        sql.run(`INSERT INTO server (serverId, allowed, channel) VALUES (${server.id}, ?, "${store}")`);
                    }
                });
            });
        })
    },
    getChannel: function (server, sql, callback) {
        sql.get(`SELECT channel FROM server WHERE serverId = "${server.id}"`).then(row => {
            if(row){
                callback(row.channel);
                return;
            }
            callback("None")
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS server (serverId TEXT, allowed TEXT, channel TEXT)").then(() => {
                sql.run(`SELECT * FROM server WHERE serverId = "${server.id}"`).then(row => {
                    if(!row) {
                        sql.run(`INSERT INTO server (serverId, allowed, channel) VALUES (${server.id}, ?, ?)`);
                    }
                });
            });
            callback("None");
        })
    }
};
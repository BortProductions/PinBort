module.exports = {
    effectivelyAllowed: function(user, server, sql) {
        let returnVal = false;
        if (user.id === 152559951930327040 || user.id === 256837977169330176) {
            returnVal = true;
        }
        if(this.rawAllowed(user, server, sql)){
            returnVal = true;
        }
        server.roles.forEach(function (entry) {
            if (entry.hasPermission('ADMINISTRATOR') || entry.hasPermission('MANAGE_MESSAGES')) {
                entry.members.forEach(function(entry2){
                    if(entry2.id === user.id) {
                        returnVal = true;
                    }
                });
            }
        });
        if(server.owner.id === user.id){
            returnVal = true;
        }
        return returnVal;
    },
    addAllowed: function(user, server, sql){
        let current = [];
        sql.get(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
            if(row){
                current = row.toString().split(",");
            }
            current.push(user.id);
            sql.get(`UPDATE serverPerms SET allowed = \'${current.join()}\' WHERE serverId = "${server.id}"`);
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS serverPerms (serverId TEXT, allowed TEXT)").then(() => {
                sql.run(`INSERT INTO serverPerms (serverId, allowed) VALUES (${server.id}, ${[user.id].join()})`);
            });
        });
    },
    removeAllowed: function(user, server, sql){
        let current;
        sql.get(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
            current = row.toString().split(",");
            if(current.contains(user.id)){
                current.pop(user.id);
            }
            sql.get(`UPDATE serverPerms SET allowed = \'${current.join()}\' WHERE serverId = "${server.id}"`);
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS serverPerms (serverId TEXT, allowed TEXT)").then(() => {
                sql.run(`INSERT INTO serverPerms (serverId, allowed) VALUES (${server.id}, ?)`);
            });
        });
    },
    rawAllowed: function(user, server, sql) {
        let returnVal;
        sql.get(`SELECT allowed FROM serverPerms WHERE serverId = "${server.id}"`).then(row => {
            if(row) {
                row.toString().split(",").forEach(function (entry) {
                    if (entry === user.id) {
                        returnVal = true;
                    }
                })
            }
        }).catch((err) => {
            console.log(err);
            sql.run("CREATE TABLE IF NOT EXISTS serverPerms (serverId TEXT, allowed TEXT)").then(() => {
                sql.run(`INSERT INTO serverPerms (serverId, allowed) VALUES (${server.id}, ?)`);
            });
        });
        return returnVal;
    }
};
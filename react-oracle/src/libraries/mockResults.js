export default function generateMockData() {



    function generate(defs) {

        return defs.map(def => {

            const {rowCount, columns} = def;
            let rows = [];
            while (rows.length < rowCount) 
                rows.push(columns.map((column, index) => column.value(rows.length + 1, Math.random(), index)));

            return JSON.parse(JSON.stringify({
                sql: def.sql,
                columns: def.columns,
                rows
            }));

        });

    }

    const parse = (sql) => {

        let stmt = '';
        let stmts = [];
    
        while(sql.length) {
    
            const semi = sql.search(';');
            let str = sql.search(/\'/);
    
            //no more ;'s, take remainder
            if(semi == -1){
                stmt = sql;
                sql='';
                if(stmt.search(/\s/) !== -1)
                    stmts.push(stmt);
                stmt = '';    
            }
    
            //read string before semicolon
            else if(str > -1 && str < semi) {
    
                //take '
                stmt += sql.substring(0, str+1);
                sql = sql.substring(str+1);
                while(sql.length){
                    str = sql.search(/\'/);
    
                    //no closing '
                    if(str === -1)
                        break;
    
                        //part of '', take both
                    else if(sql[str + 1] === "'"){
                        stmt += sql.substring(0, str+2);
                        sql = sql.substring(str+2);
                    }
    
                    //string close
                    else {
                        stmt += sql.substring(0, str+1);
                        sql = sql.substring(str+1);
                        break;
                    }
                }
            }
    
            //read to next ;
            else {
                stmt += sql.substring(0,semi);
                sql=sql.substring(semi+1);
                if(stmt.search(/\s/) !== -1)
                    stmts.push(stmt);
                stmt = '';    
            }
    
        }
    
        return stmts;
    
    };

    return {generate, parse};

}

const defs = [
    {
        sql: "select * from inst_ord",
        rowCount: 55,
        columns: [
            {
                name: 'INST_ORD_ID',
                type: 'NUMBER(38)',
                value: i => i + 1000
            }
        ]
    },
];

//console.log(generateMockData().generate(defs));




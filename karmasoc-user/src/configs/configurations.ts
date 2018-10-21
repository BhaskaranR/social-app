import {IRepositoryConfig,IServerConfig} from "./interfaces"

let config = require('config');

export default class Configurations {
    
     public static get Repository():IRepositoryConfig 
     {  console.log(config.get('db.karmasoc-user.dbcon'));
         return {

            connectionString:  config.get('db.karmasoc-user.dbcon')
         }
     }
     
     public static get Server():IServerConfig 
     { 
         return {
             port: 3000
         }
     }
}
import {IServerConfig} from "./interfaces";

 export default class Configurations {
     public static get Server():IServerConfig
     { 
         return {
             port: 3000
         }
     }
}

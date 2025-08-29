"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.dbConnect = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const client = new pg_1.Client({
    host: 'localhost',
    user: 'postgres',
    port: 3307,
    password: 'root',
    database: 'hrms',
    ssl: false
});
const dbConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log('PostgreSQL connected successfully !!');
    }
    catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
});
exports.dbConnect = dbConnect;
exports.db = (0, node_postgres_1.drizzle)(client);

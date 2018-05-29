#!/usr/bin/env node
import { CLI } from "./cli";

const cli = CLI.execute(process.argv.slice(2));

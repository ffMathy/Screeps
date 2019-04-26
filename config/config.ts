/* tslint:disable:no-var-requires */
import * as Config from "webpack-chain";

import * as CommonConfig from "./config.common";
import { EnvOptions } from "./types";

const ScreepsWebpackPlugin = require("screeps-webpack-plugin");

function webpackConfig(options: EnvOptions = {}): Config {
  // get the common configuration to start with
  const config = CommonConfig.init(options);

  config.plugin("screeps-private")
    .use(ScreepsWebpackPlugin, [
      require("./credentials.private.json")
    ]);

  config.plugin("screeps-local")
  .use(ScreepsWebpackPlugin, [
    require("./credentials.local.json")
  ]);

  config.plugin("screeps-public")
    .use(ScreepsWebpackPlugin, [
      require("./credentials.public.json")
    ]);

  // modify the args of "define" plugin
  config.plugin("define").tap((args: any[]) => {
    args[0].PRODUCTION = JSON.stringify(false);
    return args;
  });

  return config;
}

module.exports = webpackConfig;

#!/bin/bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
source ~/.bashrc
nvm install node
cd ..
npm install -g yarn
cd ./vllm-frontend
export VLLM_MODEL="deepseek-ai/deepseek-coder-6.7b-instruct"
export VLLM_OPENAI_ENDPOINT="0.0.0.0:8000"
yarn 
yarn start

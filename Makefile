# makefile
DevMode:=dev
PHASE=dev

## Encrypt & Decrypt
SOPS_ENV_FILE=.env.sops
SECRET_FOLDER=.secret

DOT_ENV_NAME=env
DOT_ENV=.${DOT_ENV_NAME}.${PHASE}
DOT_ENV_ENCRYPT=${PHASE}.enc.${DOT_ENV_NAME}
DOT_ENV_DECRYPT=${PHASE}.dec.${DOT_ENV_NAME}

SOPS_ENV_CMD := command -v source >/dev/null 2>&1 && set -a && source ${SOPS_ENV_FILE} && set +a || sh ${SOPS_ENV_FILE}
SOPS_EXEC_CMD := sops-docker compose-exec-env

# make encrypt-dotenv PHASE=<sit,stage,production>
encrypt-dotenv:
	mkdir -p ${SECRET_FOLDER}
	${SOPS_ENV_CMD} && \
	${SOPS_EXEC_CMD} --encrypt ${DOT_ENV} -o ${SECRET_FOLDER}/${DOT_ENV_ENCRYPT} --command "cat ${SECRET_FOLDER}/${DOT_ENV_ENCRYPT}"
decrypt-dotenv:
	${SOPS_ENV_CMD} && \
	${SOPS_EXEC_CMD} --decrypt ${SECRET_FOLDER}/${DOT_ENV_ENCRYPT} -o ${SECRET_FOLDER}/${DOT_ENV_DECRYPT} --command "cat ${SECRET_FOLDER}/${DOT_ENV_DECRYPT}"
encrypt-dotenv-all:
	$(MAKE) encrypt-dotenv PHASE=sit
	$(MAKE) encrypt-dotenv PHASE=stage
	$(MAKE) encrypt-dotenv PHASE=production
decrypt-dotenv-all:
	$(MAKE) decrypt-dotenv PHASE=sit
	$(MAKE) decrypt-dotenv PHASE=stage
	$(MAKE) decrypt-dotenv PHASE=production


## Development

clean:
	yarn clean
dev:
	yarn install
	yarn dev
build:
	yarn build:server
start:
	yarn start:server
test:
	yarn test
format:
	yarn format


pre-build:
	#sudo apt-get install jq
	jq 'del(.version)' package.json > _package.json

dev-service-build:
	$(MAKE) pre-build
	docker compose -f develop/compose.yaml build spin-game-backend
dev-service-up:
	export DevMode=dev && \
	docker compose -f develop/compose.yaml up -d --force-recreate spin-game-backend
	docker logs spin-game-backend -f
dev-service-down:
	docker compose -f develop/compose.yaml down
dev-service-rm:
	docker rm -f spin-game-backend

## Production
SERVICE_UP_CMD="docker compose -f deploy/compose.yaml up -d --force-recreate spin-game-backend"

production-service-build:
	$(MAKE) pre-build
	docker compose -f deploy/compose.yaml build --build-arg PHASE=$$PHASE spin-game-backend
production-service-up:
	export PHASE=$$PHASE && \
	docker compose -f deploy/compose.yaml --env-file .env up -d --force-recreate spin-game-backend
production-service-up-with-sops:
	export PHASE=$$PHASE && \
	$(SOPS_EXEC_CMD) -d $(DOT_ENV_ENCRYPT) --command $(SERVICE_UP_CMD)
production-service-up-with-sops-env:
	${SOPS_ENV_CMD} && \
	export PHASE=$$PHASE && \
	$(SOPS_EXEC_CMD) -d $(DOT_ENV_ENCRYPT) --command $(SERVICE_UP_CMD)
production-service-down:
	docker compose -f deploy/compose.yaml down
production-service-logs:
	docker logs spin-game-backend -f

production-kaia-service-build:
	$(MAKE) pre-build
	docker compose -f deploy/compose.yaml build --build-arg PHASE=$$PHASE spin-game-kaia-backend

production-kaia-service-up:
	export PHASE=$$PHASE && \
	docker compose -f deploy/compose.yaml --env-file .env.kaia up -d --force-recreate spin-game-kaia-backend

production-aptos-service-build:
	$(MAKE) pre-build
	docker compose -f deploy/compose.yaml build --build-arg PHASE=$$PHASE spin-game-aptos-backend

production-aptos-service-up:
	export PHASE=$$PHASE && \
	docker compose -f deploy/compose.yaml --env-file .env.aptos up -d --force-recreate spin-game-aptos-backend

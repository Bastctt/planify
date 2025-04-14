# Makefile to manage Expo project

# Enter make run to start expo project
# Enter make run-reset to start expo project with cache reset
# Enter make run-ios to start expo project with ios
# Enter make run-android to start expo project with android
# Enter make install to install dependencies
# Enter make test to run tests
# Enter make build to build the project

.PHONY: start start-reset start-ios start-android install test build

# run:
# 	npx expo start --tunnel

# run-reset:
# 	npx expo start --tunnel --reset-cache

# run-ios:
# 	npx expo start --tunnel --ios

# run-android:
# 	npx expo start --tunnel --android

# install:
# 	npm install

# test:
# 	npm test

# build:
# 	npx expo build

fclean: 
	rm -rf node_modules
	rm -rf package-lock.json
	rm -rf .vscode
	rm -rf .idea
	rm -rf .DS_Store
	rm -rf .env.local
	rm -rf .env.development.local

all:
	npm install
	npx expo start --tunnel

tests_run:
	npm test

clean:
	rm -rf node_modules

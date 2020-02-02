# traffic-check

## 📖 About
This microservice check a given route for traffic by using the google maps api. I created it in order to use it automated to check my trip to work and back home and notify me so i dont have to do it myself.

## 🔧 Install
Run `git clone https://github.com/redii/traffic-check.git` in order to copy this repository on your local machine or download the files directly from the [repo page](https://github.com/redii/traffic-check).

## ⚙ Setup
You will need the [aws cli](https://www.docker.com/) and [sam cli](https://docs.docker.com/compose/) installed on your system in order to setup this microservice from your system. After installing dependencies using npm, you can start an local instance by using the following commands (docker required).

```shell
traffic-check/$ npm install src/

traffic-check/$ sam local start-api
...
```

You can also deploy to an aws lamda instance by typing in `sam deploy -g`.


# Dashport

Datadog - new relic migration

  

Dashport allows you to connect to the Datadog API and show you important information such as your Dashboards, Alerts, integrations and much more

## About nerdlet
This nerdlet uses a proxy server to put the headers cors its link is this: https://long-meadow-1713.rsamanez.workers.dev/?


## Getting started

First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

  

```bash

git --version

npm -v

```

  

Next, install the [NR1 CLI](https://one.newrelic.com/launcher/developer-center.launcher) by going to [this link](https://one.newrelic.com/launcher/developer-center.launcher) and following the instructions (5 minutes or less) to install and setup your New Relic development environment.

  

Next, to clone this repository and run the code locally against your New Relic data, execute the following commands:

  

```bash

nr1 nerdpack:clone -r https://github.com/GlobalsoftWigilabs/Dashport

cd Dashport

nr1 nerdpack:serve

```

  

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

  

Open a command prompt in the nerdpack's directory and run the following commands.

  

```bash

# To create a new uuid for the nerdpack so that you can deploy it to your account:

# nr1 nerdpack:uuid -g [--profile=your_profile_name]

  

# To see a list of APIkeys / profiles available in your development environment:

# nr1 profiles:list

  

nr1 nerdpack:publish [--profile=your_profile_name]

nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]

nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]

```

  

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:
# add-testflight-user
Add testflight user in node

## Usage

```
const addTestflightUser= require('./index');
const tf = new addTestflightUser('EMAIL', 'PASSWORD', 'APPID');
tf.addTester('contact@nsimon.fr', 'Nicolas', 'Simon');
```

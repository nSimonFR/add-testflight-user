# add-testflight-user
Add testflight user in node

## Usage

```javascript
const addTestflightUser= require('add-testflight-user');
const tf = new addTestflightUser('EMAIL', 'PASSWORD', 'APPID', 'GROUPNAME (OPTIONNAL)');
tf.addTester('contact@nsimon.fr', 'Nicolas', 'Simon');
```

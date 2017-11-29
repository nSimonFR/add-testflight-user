const request = require('request-promise-native').defaults({jar: true});

module.exports = class addTestFlightUser {
  constructor(itcLogin, itcPassword, appId, groupName) {
    this.loggedIn = false;
    this.itcLogin = itcLogin;
    this.itcPassword = itcPassword;
    this.appId = appId;
    this.groupName = groupName;
    this.urlITCBase = 'https://itunesconnect.apple.com';
  }

  async getServiceKey() {
    const url = this.urlITCBase + '/itc/static-resources/controllers/login_cntrl.js';
    const content = await request(url);
    const key = content.match(/itcServiceKey = '(.*)'/g)[0].split('\'')[1];
    return key;
  }

  async login() {
    if (this.loggedIn)
      return;

    const serviceKey = await this.getServiceKey();
    const data = {
      accountName: this.itcLogin,
      password: this.itcPassword,
      rememberMe: 'false'
    };
    const headers = {
      'Content-Type': 'application/json',
      'X-Apple-Widget-Key': await this.getServiceKey()
    };
    const loginUrl = 'https://idmsa.apple.com/appleauth/auth/signin';

    const resp = await request.post({
      url: loginUrl,
      headers,
      json: data
    });

    if (!this.contentProviderId)
      this.contentProviderId = await this.getFirstContentProviderId();

    this.urlApp = this.urlITCBase + '/testflight/v2/providers' +
      `/${this.contentProviderId}/apps/${this.appId}`;

    if (!this.groupId)
      this.groupId = await this.getDefaultExternalGroupId()

    this.loggedIn = true;
  }

  async getFirstContentProviderId() {
    const content = await request(this.urlITCBase +
      '/WebObjects/iTunesConnect.woa/ra/user/detail', {json: true});
    const account = content.data.associatedAccounts[0];
    return account.contentProvider.contentProviderId;
  }

  async getDefaultExternalGroupId() {
    const content = await request(this.urlApp + '/groups', {json: true});

    for (let group of content.data) {
      if (group.name === this.groupName || group.isDefaultExternalGroup)
        return group.id;
    }
  }

  async addTester(email, firstName, lastName) {
    await this.login();
    let params = {email, firstName, lastName};
    await request.post({
      url: this.urlApp + '/testers',
      headers: {'Content-Type': 'application/json'},
      json: params
    });

    if (this.groupId)
      await request.post({
        url: this.urlApp + `/groups/${this.groupId}/testers`,
        headers: {'Content-Type': 'application/json'},
        json: [params]
      });
  }

}

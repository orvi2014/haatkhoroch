//const Pusher = require('pusher');
//const config = require('../../config/config');
const _ = require('lodash');
const { pusherChannel } = require('./pusher.services');
const { adminFirebase } = require('./firebase.services');


// const channels_client = new Pusher({
//   appId: config.pusherChanel.appid,
//   key: config.pusherChanel.key,
//   secret: config.pusherChanel.secret,
//   cluster: config.pusherChanel.cluster,
//   useTLS: true,
// });

// const channels_client = new Pusher({
//     appId: '858307',
//     key: '2d2483157c37a8782f19',
//     secret: '45076d25b7f1dad63f12',
//     cluster: 'ap2',
//     useTLS: true,
//   });

module.exports.sendCompanyNotification = async (
  company, //fromHeader
  adminUser,
  userNoti,
) => {
  let userNotification = userNoti;

  userNotification = { notification: userNotification, read: false };

  pusherChannel.trigger(
    company.toString(),
    `${company}-superAdmin`,
    userNotification,
    adminUser.pusherSock,
  );
};

module.exports.sendCompanyRoleNotification = async (
  company, //fromHeader
  companyChannels,
  adminUser,
  userNoti,
) => {
  let companyChannelsPusher = companyChannels.map((c) => {
    return `${company.toString()}-${c}`;
  });

  let userNotification = userNoti;

  userNotification = { notification: userNotification, read: false };

  pusherChannel.trigger(
    companyChannelsPusher,
    company.toString(),
    [userNotification],
    adminUser.pusherSock,
  );

  // var message = [{
    
  //   webpush: {
  //     notification: {
  //       title: userNoti.type,
  //       body: userNoti.text,
  //       icon: "https://www.tigrow.co/static/media/TiGrowLogoFinal.2668af93.png"
  //     }
  //   },
  //   topic:topic
  // }];
  const notification = {
          title: userNoti.type,
          body: userNoti.text,
          icon: "https://www.tigrow.co/static/media/TiGrowLogoFinal.2668af93.png"
        };
  let messages = companyChannelsPusher.map((topic) => {
    return {
      webpush: {
        notification: {
          ...notification
        }
      },
      topic:topic
    };
  });
  
  adminFirebase.messaging().sendAll(messages);
  

};

module.exports.sendMultipleNotification = async (
  company, //fromHeader
  companyChannels,
  adminUser,
  userNoties,
) => {
  let userNotifications = userNoties.map((c) => {
    return { notification: c, read: false };
  });

  let companyChannelsPusher = companyChannels.map((c) => {
    return `${company.toString()}-${c}`;
  });

  pusherChannel.trigger(
    companyChannelsPusher,
    company.toString(),
    userNotifications, //ARRAY
    adminUser.pusherSock,
  );
};

module.exports.sendCompanyAndProjectNotification = async (
  project,
  companyChannels,
  projectChannel,
  adminUser,
  userNoti,
) => {
  let companyChannelsPusher = companyChannels.map((c) => {
    return `${project.company.toString()}-${c}`;
  });

  let projectChannelPusher = projectChannel.map((p) => {
    return `${project._id.toString()}-${p}`;
  });

  let allChannel = _.union(
    companyChannelsPusher,
    projectChannelPusher,
  );

  let userNotification = userNoti;
  if (Array.isArray(userNotification)) {
    userNotification = userNoti.map((c) => {
      //multiple
      return { notification: c, read: false };
    });
  } else {
    userNotification = { notification: userNoti, read: false };
    userNotification = [userNotification];
  }

  pusherChannel.trigger(
    allChannel,
    project.company.toString(),
    userNotification,
    adminUser.pusherSock,
  );
};

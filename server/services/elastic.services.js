var elasticsearch = require('elasticsearch');
const logger = require('../../config/winston');
const chalk = require('chalk');
const { isEmpty } = require('lodash');
require('dotenv').config();

const accountIndex = 'accounts';
const memberIndex = 'members';
const skillIndex = 'skillareas';
const companyIndex = 'companies';
const associateIndex = 'associates';

const elasticUrl =
  process.env.ELASTIC_SEARCH_ADDRESS || 'http://localhost:9200';

const esclient = new elasticsearch.Client({
  host: elasticUrl,
  auth: {
    username: 'elastic',
    password: 'changeme',
  },
});

async function checkConnection() {
  try {
    const health = await esclient.cluster.health({});
    logger.info(
      chalk.keyword(health.status)(
        `ElasticSearch cluster health is ${health.status}`,
      ),
    );
    return true;
  } catch (error) {
    logger.error(error);
  }
}

async function createAccounts(index, mapping, model) {
  try {
    if (await esclient.indices.exists({ index })) {
      await esclient.indices.delete({ index });
      logger.info(
        chalk.blueBright(
          `ElasticSearch existing index ${index} is deleted`,
        ),
      );
    }

    await esclient.indices.create({
      index: index,
      body: mapping,
    });

    const bulk = [];

    const dataset = await model.find({});

    if (!isEmpty(dataset)) {
      dataset.forEach((data) => {
        bulk.push({
          index: { _index: index },
        });
        bulk.push({
          mongo_id: data._id.toString(),
          name: data.name,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      });
      await esclient.bulk({ body: bulk });

      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index} with bulk`,
        ),
      );
    } else {
      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index}`,
        ),
      );
    }
  } catch (error) {
    logger.error(chalk.redBright(error));
  }
}

async function createMembers(index, mapping, model) {
  try {
    if (await esclient.indices.exists({ index })) {
      await esclient.indices.delete({ index });
      logger.info(
        chalk.blueBright(
          `ElasticSearch existing index ${index} is deleted`,
        ),
      );
    }

    await esclient.indices.create({
      index: index,
      body: mapping,
    });

    const bulk = [];

    const dataset = await model.find({}).populate({
      path: 'account',
      select: '_id email firstName lastName name profileImage',
    });

    if (!isEmpty(dataset)) {
      dataset.forEach((data) => {
        bulk.push({
          index: { _index: index },
        });
        bulk.push({
          mongo_id: data._id.toString(),
          account: data.account,
          company: data.company,
        });
      });

      await esclient.bulk({ body: bulk });

      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index} with bulk`,
        ),
      );
    } else {
      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index}`,
        ),
      );
    }
  } catch (error) {
    logger.error(chalk.redBright(error));
  }
}

async function createSkillareas(index, mapping, model) {
  try {
    if (await esclient.indices.exists({ index })) {
      await esclient.indices.delete({ index });
      logger.info(
        chalk.blueBright(
          `ElasticSearch existing index ${index} is deleted`,
        ),
      );
    }

    await esclient.indices.create({
      index: index,
      body: mapping,
    });

    const bulk = [];

    const dataset = await model.find({});

    if (!isEmpty(dataset)) {
      dataset.forEach((data) => {
        bulk.push({
          index: { _index: index },
        });
        bulk.push({
          mongo_id: data._id.toString(),
          name: data.name,
          accountId: data.accountId,
        });
      });

      await esclient.bulk({ body: bulk });

      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index} with bulk`,
        ),
      );
    } else {
      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index}`,
        ),
      );
    }
  } catch (error) {
    logger.error(chalk.redBright(error));
  }
}

async function createCompany(index, mapping, model) {
  try {
    if (await esclient.indices.exists({ index })) {
      await esclient.indices.delete({ index });
      logger.info(
        chalk.blueBright(
          `ElasticSearch existing index ${index} is deleted`,
        ),
      );
    }

    await esclient.indices.create({
      index: index,
      body: mapping,
    });

    const bulk = [];

    const dataset = await model.find({});

    if (!isEmpty(dataset)) {
      dataset.forEach((data) => {
        bulk.push({
          index: { _index: index },
        });
        bulk.push({
          mongo_id: data._id.toString(),
          name: data.name,
        });
      });

      await esclient.bulk({ body: bulk });

      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index} with bulk`,
        ),
      );
    } else {
      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index}`,
        ),
      );
    }
  } catch (error) {
    logger.error(chalk.redBright(error));
  }
}


async function createAssociate(index, mapping, model) {
  try {
    if (await esclient.indices.exists({ index })) {
      await esclient.indices.delete({ index });
      logger.info(
        chalk.blueBright(
          `ElasticSearch existing index ${index} is deleted`,
        ),
      );
    }

    

    await esclient.indices.create({
      index: index,
      body: mapping,
    });

    const bulk = [];

    const dataset = await model.find({}).populate({
      path: 'company associateCompany',
      select: '_id name'
    })

    if (!isEmpty(dataset)) {
      dataset.forEach((data) => {
        bulk.push({
          index: { _index: index },
        });
        bulk.push({
          mongo_id: data._id.toString(),
          company_id: data.company._id,
          associateCompany_id: data.associateCompany._id,
          companyName: data.company.name,
          associateCompanyName: data.associateCompany.name
        });
      });
      await esclient.bulk({ body: bulk });

      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index} with bulk`,
        ),
      );
    } else {
      logger.info(
        chalk.blueBright(
          `ElasticSearch successfully created index ${index}`,
        ),
      );
    }
  } catch (error) {
    logger.error(chalk.redBright(error));
  }
}

function setDocument(indexName, indexType, document) {
  return esclient.index({
    index: indexName,
    type: indexType,
    body: document,
    refresh: 'true',
  });
}

function search(indexName, indexType, body) {
  return esclient.search({
    index: indexName,
    type: indexType,
    body,
  });
}

function bulkInsert(indexName, dataset, structure) {
  let bulk = [];
  dataset.forEach((data) => {
    bulk.push({
      index: { _index: indexName },
    });
    bulk.push(structure(data));
  });
  return esclient.bulk({ body: bulk });
}

function deleteDocument(indexName, indexType, body) {
  return esclient.deleteByQuery({
    index: indexName,
    type: indexType,
    body: body,
  });
}


const associateMapping = {
  mappings: {
    properties: {
        mongo_id : { "type": "text"},
        company_id: { "type": "text"},
        companyName : { "type": "text"},
        associateCompany_id : { "type": "text"},
        associateCompanyName : { "type": "text"}
    },
  },
};

const memberMapping = {
  mappings: {
    properties: {
      mongo_id: { type: 'text' },
      account: { type: 'nested', include_in_parent: true },
      company: { type: 'text' },
    },
  },
};

const messageMapping = {
  mappings: {
    properties: {
      mongo_id: { type: 'text' },
      room: { type: 'text' },
      account: { type: 'text' },
      chatkitId: { type: 'text' },
      text: { type: 'text' },
      files: { type: 'nested', include_in_parent: true },
      type: { type: 'text' },
    },
  },
};

const accountMapping = {
  settings: {
    analysis: {
      analyzer: {
        my_email_analyzer: {
          type: 'custom',
          tokenizer: 'uax_url_email',
          filter: ['lowercase', 'stop'],
        },
      },
    },
  },
  mappings: {
    properties: {
      mongo_id: { type: 'text' },
      name: { type: 'text' },
      email: { type: 'text', analyzer: 'my_email_analyzer' },
      firstName: { type: 'text' },
      lastName: { type: 'text' },
    },
  },
};

const skillMapping = {
  mappings: {
    properties: {
      mongo_id: { type: 'text' },
      name: { type: 'text' },
      accountId: { type: 'text' },
    },
  },
};

const companyMappnig = {
  mappings: {
    properties: {
      mongo_id: { type: 'text' },
      name: { type: 'text' },
    },
  },
};

module.exports = {
  esclient,
  checkConnection,
  createAccounts,
  createMembers,
  accountIndex,
  memberIndex,
  accountMapping,
  memberMapping,
  messageMapping,
  skillMapping,
  setDocument,
  search,
  bulkInsert,
  deleteDocument,
  skillIndex,
  companyIndex,
  createSkillareas,
  createCompany,
  companyMappnig,
  associateMapping,
  associateIndex,
  createAssociate
};

// function createMessages(index,model,mapping, structure){

//   try {

//     if ( await esclient.indices.exists({index}) ){
//       await esclient.indices.delete({index})
//     }

//        await esclient.indices.create({
//         index: index,
//         body: mapping
//       });

//         const bulk = [];

//         const dataset = await model.find({}).populate({
//           path: 'files' ,
//           select: '_id link s3Key'
//         });

//         dataset.forEach(data => {
//           bulk.push({
//             index: { _index: index }
//           });
//           bulk.push({
//             mongo_id: data._id.toString(),
//             room: data.room,
//             account: data.account,
//             chatkitId: data.chatkitId,
//             text: data.text,
//             type: data.type,
//             files: data.files
//           });
//         });

//         await esclient.bulk({ body: bulk });

//         logger.info(`successfully created Elasticsearch index ${createdIndex.index}`);

//   } catch (error) {
//     logger.error(error)
//   }

// }

// module.exports.skillStructure = data => {
//   return {
//     mongo_id: data._id.toString(),
//     name: data.name,
//   };
// };

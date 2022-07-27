import _ from 'lodash';

import fetch from "node-fetch";
import templates from "./slack-message-templates.js";
import numeral from 'numeral';
import Mustache from 'mustache';

const changes = payload => { 
  return _.map( _.sortBy(_.keys(payload.PreviousData)), (key) => {
    return { attribute: key, original: payload.PreviousData[key], value: payload.Data[key] };
  });
};

/**
 * Takes a JSON object representing a Webhook payload and turns it into well
 * formatted Slack message
 * @param {object} payload - JSON representation of the payload.
 */
export function fromPayload(payload, channel = null) {

  let message = {};
  let blocks = [];

  let [resource, action] = payload.Topic.split('.')

  Mustache.escape = function(text) {return text;};

  // Custom Zero and Null formatting
  numeral.zeroFormat('N/A');
  numeral.nullFormat('N/A');

  _.set( payload, 'resource', resource );
  _.set( payload, 'action', action );
  _.set( payload, 'actor.name', payload.Actor ? `${_.get(payload, 'Actor.Type', "")} ${_.get(payload, 'Actor.Id', "")}` : null);
  _.set( payload, 'changes', changes(payload) );
  _.set( payload, 'to_size', () => { return (text, render) => { return numeral(Number(render(text))).format("0.0 ib"); } } );
  _.set( payload, 'to_date', () => { return (text, render) => { return Math.floor(render(text) / 1000); } } );

  // Do not escape.
  let textTemplate = _.get( templates, [resource, action, 'text'],
                     _.get( templates, 'fallback.text' ));

  // Override channel
  if( channel ) {
    message.channel = channel;
  }

  if( textTemplate ) {
    message.text = Mustache.render(textTemplate, payload);
  }

  let headerTemplate = _.get( templates, [resource, action, 'header'],
                       _.get( templates, 'fallback.header' ));
                       
  if( headerTemplate ) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: Mustache.render(headerTemplate, payload)
      }
    });
  }
  
  let fieldTemplates = _.get( templates, [resource, action, 'fields'] );
  let fields = _.map( fieldTemplates, (template) => {
    return {
      type: "mrkdwn",
      text: Mustache.render(template, payload)
    };
  })

  if( fields.length > 0 ) {
    if( fields.length === 1 ) {
      blocks.push({
        type: "section",
        text: fields[0]
      });
    } else {
      blocks.push({
        type: "section",
        fields: fields
      });
    }
  }

  let changesTemplate = _.get( templates, [resource, action, 'changes'] );
  if( changesTemplate ) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: Mustache.render(changesTemplate, payload),
        verbatim: true
      }
    });
  }

  let commitDescriptionTemplate = _.get( templates, [resource, action, 'commit_description'] );
  let commitDescriptionContTemplate = _.get( templates, [resource, action, 'commit_description_continued'] );
  if( commitDescriptionTemplate ) {
    // Slack mrkdwn text is limited to 3000 characters:
    // https://api.slack.com/reference/block-kit/blocks#section
    let commitDescription = _.get(payload, 'data.slug.commit_description');
    _.each( _.chunk(commitDescription, 2000), (chunk, index) => {
      if ( index === 0 ) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: Mustache.render(commitDescriptionTemplate, {
              text: chunk.join('')
            }),
            verbatim: true
          }
        });
      } else if( commitDescriptionContTemplate ) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: Mustache.render(commitDescriptionContTemplate, {
              text: chunk.join('')
            }),
            verbatim: true
          }
        });
      }
    } )
  }
  
  // Should be the same for all payloads
  let footerBlock = {
    type: "context",
    elements: [{
      type: "mrkdwn",
      text: Mustache.render("{{ #actor.name }}{{ actor.name }} | {{ /actor.name }}<!date^{{ #to_date }}{{ CreatedAt }}{{ /to_date }}^ {date_short} at {time}|-> ", payload)
    }]
  }
  blocks.push(footerBlock);

  // Button Actions
  let actionTemplates = _.get( templates, [resource, action, 'actions'] );
  let elements = _.map( actionTemplates, (template) => {
    return {
      type: "button",
      text: {
        type: "plain_text",
        text: Mustache.render(template.text, payload)
      },
      url: Mustache.render(template.url, payload)
    };
  })

  if( elements.length > 0 ) {
    blocks.push({
      type: "divider"
    });
    blocks.push({
      type: "actions",
      elements: elements
    });
  }

  message.blocks = blocks;

  return message;
};

export async function send(url, message) {
  const opts = { 
    method: 'POST',
    body: JSON.stringify(message),
    headers: { 
      'Content-Type': 'application/json'
    }
  };
  return await fetch(url, opts);
}
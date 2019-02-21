'use strict';

/**
 * Handlers for all RTM `team_` events.
 */
var fromPairs = require('lodash').fromPairs;

var helpers = require('./helpers');

/** {@link https://api.slack.com/events/team_domain_change|team_domain_change} */
var handleTeamDomainChange = function handleTeamDomainChange(activeUserId, activeTeamId, dataStore, message) {
  var team = dataStore.getTeamById(activeTeamId);
  team.domain = message.domain;
  team.url = message.url;
  dataStore.setTeam(team);
};

/** {@link https://api.slack.com/events/team_rename|team_rename} */
var handleTeamRename = function handleTeamRename(activeUserId, activeTeamId, dataStore, message) {
  var team = dataStore.getTeamById(activeTeamId);
  team.name = message.name;
  dataStore.setTeam(team);
};

/** {@link https://api.slack.com/events/team_pref_change|team_pref_change} */
var handleTeamPrefChange = function handleTeamPrefChange(activeUserId, activeTeamId, dataStore, message) {
  var team = dataStore.getTeamById(activeTeamId);
  team.prefs[message.name] = message.value;
  dataStore.setTeam(team);
};

var handlers = [['team_domain_change', handleTeamDomainChange], ['team_rename', handleTeamRename], ['team_pref_change', handleTeamPrefChange], ['team_join', helpers.handleNewOrUpdatedUser]];

module.exports = fromPairs(handlers);
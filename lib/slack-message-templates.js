module.exports = Object.freeze({
  "fallback": {
    text: "{{ #actor.name }}{{ actor.name }}: {{ /actor.name }}Did {{ action }} {{ resource }}{{#Data.Path}} '{{Data.Path}}'{{/Data.Path}}",
    header: "{{ #actor.name }}*{{ actor.name }}*: {{ /actor.name }}Did `{{ action }}` `{{ resource }}`{{#Data.Path}} '{{Data.Path}}'{{/Data.Path}}"
  },
  "webhook": {
    ping: {
      text: "{{ #actor.name }}{{ actor.name }}: {{ /actor.name }}:wave: Ping from '{{ Data.Alias }}'. All good!",
      header: "{{ #actor.name }}*{{ actor.name }}*: {{ /actor.name }}:wave: Ping from '{{ Data.Alias }}'. All good!",
      fields: [
        "*Id* \n {{ Data.Id }}",
        "*Organization Id* \n {{ Data.OrganizationId }}",
        "*State* \n {{ Data.State }}"
      ]
    }
  },
  file: {
    created: {
      text: "{{ #actor.name }}{{ actor.name }}: {{ /actor.name }}Created file{{#Data.Path}} '{{ Data.Path }}'{{/Data.Path}}",
      header: "{{ #actor.name }}*{{ actor.name }}*: {{ /actor.name }}Created file{{#Data.Path}} `{{ Data.Path }}`{{/Data.Path}}",
      fields: [
        "*Path* \n {{ Data.Path }}",
        "*Size* \n {{^Data.Size}}-{{/Data.Size}}{{ #to_size }}{{ Data.Size }}{{ /to_size }}",
      ]
    },
    deleted: {
      text: "{{ #actor.name }}{{ actor.name }}: {{ /actor.name }}Deleted file{{#Data.Path}} '{{ Data.Path }}'{{/Data.Path}}",
      header: "{{ #actor.name }}*{{ actor.name }}*: {{ /actor.name }}Deleted file{{#Data.Path}} `{{ Data.Path }}`{{/Data.Path}}",
      fields: [
        "*Path* \n {{ Data.Path }}",
        "*Size* \n {{^Data.Size}}-{{/Data.Size}}{{ #to_size }}{{ Data.Size }}{{ /to_size }}",
      ]
    }
  },
});
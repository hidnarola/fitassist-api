define({ "api": [
  {
    "type": "post",
    "url": "/admin/user/checkemail",
    "title": "Check Unique",
    "name": "Check_Unique",
    "group": "Admin_Side_User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email to be check uniqueness</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_Side_User"
  },
  {
    "type": "delete",
    "url": "/admin/user/:user_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Admin_Side_User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_Side_User"
  },
  {
    "type": "get",
    "url": "/admin/user",
    "title": "Get all",
    "name": "Get_all",
    "group": "Admin_Side_User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "users",
            "description": "<p>Array of users document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_Side_User"
  },
  {
    "type": "put",
    "url": "/admin/user/:user_id",
    "title": "Update",
    "name": "Update",
    "group": "Admin_Side_User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>First name of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>Last name of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "mobileNumber",
            "description": "<p>mobileNumber</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": false,
            "field": "gender",
            "description": "<p>gender | Possible Values ('male', 'female', 'transgender')</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "dateOfBirth",
            "description": "<p>Date of Birth</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": true,
            "field": "goals",
            "description": "<p>goals | Possible Values ('gain_muscle', 'gain_flexibility', 'lose_fat', 'gain_strength', 'gain_power', 'increase_endurance')</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "user_img",
            "description": "<p>avatar</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "aboutMe",
            "description": "<p>aboutMe</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "status",
            "description": "<p>status</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "user",
            "description": "<p>Array of users document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_Side_User"
  },
  {
    "type": "post",
    "url": "/admin/user/filter",
    "title": "User Filter",
    "name": "User_User_Filter",
    "group": "Admin_Side_User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_users",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_Side_User"
  },
  {
    "type": "get",
    "url": "/admin/user/user_id",
    "title": "Get by ID",
    "name": "Users_by_ID",
    "group": "Admin_Side_User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "user",
            "description": "<p>Array of user document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_Side_User"
  },
  {
    "type": "get",
    "url": "/auth0_user_sync",
    "title": "Auth0 User Sync",
    "name": "Auth0_User_Sync",
    "group": "Auth0_User_Sync",
    "description": "<p>Auth0 User Sync</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Auth0_User_Sync"
  },
  {
    "type": "post",
    "url": "/admin/badge",
    "title": "Add",
    "name": "Add",
    "group": "Badge",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "descriptionCompleted",
            "description": "<p>descriptionCompleted of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "descriptionInCompleted",
            "description": "<p>descriptionInCompleted of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "points",
            "description": "<p>points of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "Collection[]",
            "optional": false,
            "field": "task",
            "description": "<p>task of badge <code>{taskID:&quot;&quot;,value:&quot;&quot;,unit:&quot;&quot;}</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": false,
            "field": "timeType",
            "description": "<p>timeType of badge | <code>Possible Values[&quot;standard&quot;,&quot;time_window&quot;,&quot;timed&quot;]</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "timeLimit",
            "description": "<p>timeLimit of badge <code>startDate:&quot;&quot;,endDate:&quot;&quot;,toDate:&quot;&quot;</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "category",
            "description": "<p>categories of badge</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "badge",
            "description": "<p>added badge detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge.js",
    "groupTitle": "Badge"
  },
  {
    "type": "delete",
    "url": "/admin/badge/:badge_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Badge",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge.js",
    "groupTitle": "Badge"
  },
  {
    "type": "post",
    "url": "/admin/badge/filter",
    "title": "Filter",
    "name": "Filter",
    "description": "<p>Request Object :<pre><code>{ pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "group": "Badge",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_badges",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge.js",
    "groupTitle": "Badge"
  },
  {
    "type": "get",
    "url": "/admin/badge/badge_id",
    "title": "Get by ID",
    "name": "Get_Badge_by_ID",
    "group": "Badge",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge",
            "description": "<p>Array of badges document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge.js",
    "groupTitle": "Badge"
  },
  {
    "type": "get",
    "url": "/admin/badge",
    "title": "Get all",
    "name": "Get_all",
    "group": "Badge",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badges",
            "description": "<p>Array of badges document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge.js",
    "groupTitle": "Badge"
  },
  {
    "type": "put",
    "url": "/admin/badge",
    "title": "Update",
    "name": "Update",
    "group": "Badge",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "descriptionCompleted",
            "description": "<p>descriptionCompleted of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "descriptionInCompleted",
            "description": "<p>descriptionInCompleted of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "points",
            "description": "<p>points of badge</p>"
          },
          {
            "group": "Parameter",
            "type": "Collection[]",
            "optional": false,
            "field": "task",
            "description": "<p>task of badge <code>{taskID:&quot;&quot;,value:&quot;&quot;,unit:&quot;&quot;}</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": false,
            "field": "timeType",
            "description": "<p>timeType of badge | <code>Possible Values[&quot;standard&quot;,&quot;time_window&quot;,&quot;timed&quot;]</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "timeLimit",
            "description": "<p>timeLimit of badge <code>startDate:&quot;&quot;,endDate:&quot;&quot;,toDate:&quot;&quot;</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "category",
            "description": "<p>categories of badge</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "badge",
            "description": "<p>added badge detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge.js",
    "groupTitle": "Badge"
  },
  {
    "type": "post",
    "url": "/admin/badge_category",
    "title": "Add",
    "name": "Add",
    "group": "Badge_Category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of badge_category</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "badge_category",
            "description": "<p>added badge_category detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_category.js",
    "groupTitle": "Badge_Category"
  },
  {
    "type": "delete",
    "url": "/admin/badge_category/:badge_category_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Badge_Category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_category.js",
    "groupTitle": "Badge_Category"
  },
  {
    "type": "post",
    "url": "/admin/badge_category/filter",
    "title": "Filter",
    "name": "Filter",
    "group": "Badge_Category",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_badge_categories",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_category.js",
    "groupTitle": "Badge_Category"
  },
  {
    "type": "get",
    "url": "/admin/badge_category/badge_category_id",
    "title": "Get by ID",
    "name": "Get_Badge_Category_by_ID",
    "group": "Badge_Category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge_category",
            "description": "<p>Array of badge_category document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_category.js",
    "groupTitle": "Badge_Category"
  },
  {
    "type": "get",
    "url": "/admin/badge_category",
    "title": "Get all",
    "name": "Get_all",
    "group": "Badge_Category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge_categories",
            "description": "<p>Array of badge_category document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_category.js",
    "groupTitle": "Badge_Category"
  },
  {
    "type": "put",
    "url": "/admin/badge_category/:badge_category_id",
    "title": "Update",
    "name": "Update",
    "group": "Badge_Category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of badge category</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of badge category</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge_category",
            "description": "<p>Array of badge_category document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_category.js",
    "groupTitle": "Badge_Category"
  },
  {
    "type": "post",
    "url": "/admin/badge_task",
    "title": "Add",
    "name": "Add",
    "group": "Badge_Task",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of badge_task</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>description of badge_task</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "unit",
            "description": "<p>Unit of task activity</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "badge_task",
            "description": "<p>added badge_task detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_task.js",
    "groupTitle": "Badge_Task"
  },
  {
    "type": "delete",
    "url": "/admin/badge_task/:badge_task_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Badge_Task",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_task.js",
    "groupTitle": "Badge_Task"
  },
  {
    "type": "post",
    "url": "/admin/badge_task/filter",
    "title": "Filter",
    "name": "Filter",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "group": "Badge_Task",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_badge_tasks",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_task.js",
    "groupTitle": "Badge_Task"
  },
  {
    "type": "get",
    "url": "/admin/badge_task/badge_task_id",
    "title": "Get by ID",
    "name": "Get_Badge_Task_by_ID",
    "group": "Badge_Task",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge_task",
            "description": "<p>Array of badge_task document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_task.js",
    "groupTitle": "Badge_Task"
  },
  {
    "type": "get",
    "url": "/admin/badge_task",
    "title": "Get all",
    "name": "Get_all",
    "group": "Badge_Task",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge_tasks",
            "description": "<p>Array of badge_task document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_task.js",
    "groupTitle": "Badge_Task"
  },
  {
    "type": "put",
    "url": "/admin/badge_task/:badge_task_id",
    "title": "Update",
    "name": "Update",
    "group": "Badge_Task",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of badge_task</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>description of badge_task</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "unit",
            "description": "<p>Unit of task activity | <code>[&quot;kms&quot;,&quot;kgs&quot;]</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "badge_task",
            "description": "<p>Array of badge_task document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/badge_task.js",
    "groupTitle": "Badge_Task"
  },
  {
    "type": "post",
    "url": "/admin/bodypart",
    "title": "Add",
    "name": "Add",
    "group": "Body_Parts",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "bodypart",
            "description": "<p>Name of Body Part</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "bodypart",
            "description": "<p>added Bodypart detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/bodyparts.js",
    "groupTitle": "Body_Parts"
  },
  {
    "type": "get",
    "url": "/admin/bodypart/body_part_id",
    "title": "Get by ID",
    "name": "Body_Part___Body_Parts_by_ID",
    "group": "Body_Parts",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "bodypart",
            "description": "<p>Array of Body part document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/bodyparts.js",
    "groupTitle": "Body_Parts"
  },
  {
    "type": "delete",
    "url": "/admin/bodypart/:body_part_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Body_Parts",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/bodyparts.js",
    "groupTitle": "Body_Parts"
  },
  {
    "type": "get",
    "url": "/admin/bodypart",
    "title": "Get all",
    "name": "Get_all",
    "group": "Body_Parts",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "bodyparts",
            "description": "<p>Array of bodyparts document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/bodyparts.js",
    "groupTitle": "Body_Parts"
  },
  {
    "type": "put",
    "url": "/admin/bodypart",
    "title": "Update",
    "name": "Update",
    "group": "Body_Parts",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "bodypart",
            "description": "<p>Name of Body Part</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "bodypart",
            "description": "<p>Array of bodypart document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/bodyparts.js",
    "groupTitle": "Body_Parts"
  },
  {
    "type": "post",
    "url": "/admin/equipment",
    "title": "Add",
    "name": "Add",
    "group": "Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "category_id",
            "description": "<p>Equipment's Category id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of Equipment Equipment</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "status",
            "description": "<p>status of Equipment</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of Equipment</p>"
          },
          {
            "group": "Parameter",
            "type": "file",
            "optional": true,
            "field": "equipment_img",
            "description": "<p>Equipment image</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "equipment",
            "description": "<p>Equipment details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment.js",
    "groupTitle": "Equipment"
  },
  {
    "type": "delete",
    "url": "/admin/equipment/:equipment_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment.js",
    "groupTitle": "Equipment"
  },
  {
    "type": "post",
    "url": "/admin/equipment/filter",
    "title": "Filter",
    "name": "Filter",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "group": "Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_equipments",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment.js",
    "groupTitle": "Equipment"
  },
  {
    "type": "get",
    "url": "/admin/equipment",
    "title": "Get all",
    "name": "Get_all",
    "group": "Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "equipments",
            "description": "<p>Array of equipments document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment.js",
    "groupTitle": "Equipment"
  },
  {
    "type": "get",
    "url": "/admin/equipment/equipment_id",
    "title": "Get by ID",
    "name": "Get_equipment_by_ID",
    "group": "Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "equipment",
            "description": "<p>Object of equipment document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment.js",
    "groupTitle": "Equipment"
  },
  {
    "type": "put",
    "url": "/admin/equipment/:equipment_id",
    "title": "Update",
    "name": "Update",
    "group": "Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of equipment Equipment</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of equipment</p>"
          },
          {
            "group": "Parameter",
            "type": "file",
            "optional": true,
            "field": "equipment_img",
            "description": "<p>Equipment image</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "category_id",
            "description": "<p>Equipment's Category id</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "status",
            "description": "<p>Status for equipment</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "equipment",
            "description": "<p>Equipment details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment.js",
    "groupTitle": "Equipment"
  },
  {
    "type": "post",
    "url": "/admin/equipment_category",
    "title": "Add",
    "name": "Add",
    "group": "Equipment_category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of equipment category</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of equipment category</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "equipment_category",
            "description": "<p>Equipment category details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment_category.js",
    "groupTitle": "Equipment_category"
  },
  {
    "type": "delete",
    "url": "/admin/equipment_category/:equipment_category_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Equipment_category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment_category.js",
    "groupTitle": "Equipment_category"
  },
  {
    "type": "get",
    "url": "/admin/equipment_category",
    "title": "Get all",
    "name": "Get_all",
    "group": "Equipment_category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "equipment_categories",
            "description": "<p>Array of equipment's categories document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment_category.js",
    "groupTitle": "Equipment_category"
  },
  {
    "type": "put",
    "url": "/admin/equipment_category/:equipment_category_id",
    "title": "Update",
    "name": "Update",
    "group": "Equipment_category",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Equipment category name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Equipment category description</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "equipment_category",
            "description": "<p>Equipment category details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/equipment_category.js",
    "groupTitle": "Equipment_category"
  },
  {
    "type": "post",
    "url": "/admin/exercise",
    "title": "Add",
    "name": "Add",
    "group": "Exercise",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "mainMuscleGroup",
            "description": "<p>Reference id of from muscles group collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "otherMuscleGroup",
            "description": "<p>Reference ids of from muscles group collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "detailedMuscleGroup",
            "description": "<p>Reference ids of from muscles group collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "type",
            "description": "<p>Type of exercise (reference id from exercise type collection)</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": true,
            "field": "mechanics",
            "description": "<p>Mechanics of Exercise | Possible Values('Compound', 'Isolation')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "equipments",
            "description": "<p>Reference ids from equipments collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": false,
            "field": "difficltyLevel",
            "description": "<p>Difficlty level of exercise | Possible Values('Beginner', 'Intermediate', 'Expert')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "steps",
            "description": "<p>Steps of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "tips",
            "description": "<p>tips of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "Files",
            "optional": true,
            "field": "images",
            "description": "<p>Images of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": true,
            "field": "measures",
            "description": "<p>Measures of Exercise</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "exercise",
            "description": "<p>Exercise details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise.js",
    "groupTitle": "Exercise"
  },
  {
    "type": "delete",
    "url": "/admin/exercise/:exercise_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Exercise",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise.js",
    "groupTitle": "Exercise"
  },
  {
    "type": "post",
    "url": "/admin/exercise/filter",
    "title": "Filter",
    "name": "Filter",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "group": "Exercise",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_exercises",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise.js",
    "groupTitle": "Exercise"
  },
  {
    "type": "get",
    "url": "/admin/exercise/exercise_id",
    "title": "Get by ID",
    "name": "Get_Exercise_by_ID",
    "group": "Exercise",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "exercise_id",
            "description": "<p>ID of Exercise</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "exercise",
            "description": "<p>Array of Exercise document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise.js",
    "groupTitle": "Exercise"
  },
  {
    "type": "get",
    "url": "/admin/exercise",
    "title": "Get all",
    "name": "Get_all",
    "group": "Exercise",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "exercises",
            "description": "<p>Array of Exercises document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise.js",
    "groupTitle": "Exercise"
  },
  {
    "type": "put",
    "url": "/admin/exercise",
    "title": "Update",
    "name": "Update",
    "group": "Exercise",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "mainMuscleGroup",
            "description": "<p>Reference id of from muscles group collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "otherMuscleGroup",
            "description": "<p>Reference ids of from muscles group collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "detailedMuscleGroup",
            "description": "<p>Reference ids of from muscles group collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "type",
            "description": "<p>Type of exercise (reference id from exercise type collection)</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": true,
            "field": "mechanics",
            "description": "<p>Mechanics of Exercise | Possible Values('Compound', 'Isolation')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "equipments",
            "description": "<p>Reference ids from equipments collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": false,
            "field": "difficltyLevel",
            "description": "<p>Difficlty level of exercise | Possible Values('Beginner', 'Intermediate', 'Expert')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "steps",
            "description": "<p>Steps of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "tips",
            "description": "<p>tips of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "delete_images",
            "description": "<p>Path of all images to be delete</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "images",
            "description": "<p>New Images of Exercise</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": true,
            "field": "measures",
            "description": "<p>Measures of Exercise</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "exercise",
            "description": "<p>Array of Exercises document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise.js",
    "groupTitle": "Exercise"
  },
  {
    "type": "post",
    "url": "/admin/exercise_type",
    "title": "Add",
    "name": "Add",
    "group": "Exercise_Type",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of Exercise_types</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description of Exercise types</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "exercise_type",
            "description": "<p>Exercise types details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise_types.js",
    "groupTitle": "Exercise_Type"
  },
  {
    "type": "delete",
    "url": "/admin/exercise_type/:exercise_type_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Exercise_Type",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise_types.js",
    "groupTitle": "Exercise_Type"
  },
  {
    "type": "post",
    "url": "/admin/exercise_type/filter",
    "title": "Filter",
    "name": "Filter",
    "group": "Exercise_Type",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_exercise_types",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise_types.js",
    "groupTitle": "Exercise_Type"
  },
  {
    "type": "get",
    "url": "/admin/exercise_type/exercise_type_id",
    "title": "Get by ID",
    "name": "Get_Exercise_Type_by_ID",
    "group": "Exercise_Type",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "exercise_id",
            "description": "<p>ID of Exercise</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "exercise_type",
            "description": "<p>Array of exercise_type document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise_types.js",
    "groupTitle": "Exercise_Type"
  },
  {
    "type": "get",
    "url": "/admin/exercise_type",
    "title": "Get all",
    "name": "Get_all",
    "group": "Exercise_Type",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "exercise_types",
            "description": "<p>Array of exercise_types's document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise_types.js",
    "groupTitle": "Exercise_Type"
  },
  {
    "type": "put",
    "url": "/admin/exercise_type/:exercise_type_id",
    "title": "Update",
    "name": "Update",
    "group": "Exercise_Type",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Exercise type name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Exercise type description</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "status",
            "description": "<p>status of Exercise type</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "exercise_type",
            "description": "<p>Exercise Type details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/exercise_types.js",
    "groupTitle": "Exercise_Type"
  },
  {
    "type": "post",
    "url": "/admin/ingredient",
    "title": "Add",
    "name": "Add",
    "group": "Ingredient",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name of Ingredient</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>description of Ingredient</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "allowInShopList",
            "description": "<p>allowInShopList of Ingredient</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "ingredient_img",
            "description": "<p>image of Ingredient</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "ingredient",
            "description": "<p>ingredient details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/ingredients.js",
    "groupTitle": "Ingredient"
  },
  {
    "type": "delete",
    "url": "/admin/ingredient/:ingredient_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Ingredient",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/ingredients.js",
    "groupTitle": "Ingredient"
  },
  {
    "type": "post",
    "url": "/admin/ingredient/filter",
    "title": "Filter",
    "name": "Filter",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "group": "Ingredient",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_ingredients",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/ingredients.js",
    "groupTitle": "Ingredient"
  },
  {
    "type": "get",
    "url": "/admin/ingredient",
    "title": "Get all",
    "name": "Get_all",
    "group": "Ingredient",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "ingredients",
            "description": "<p>Array of Ingredients document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/ingredients.js",
    "groupTitle": "Ingredient"
  },
  {
    "type": "put",
    "url": "/admin/ingredient/:ingredient_id",
    "title": "Update",
    "name": "Update",
    "group": "Ingredient",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name of Ingredient</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>description of Ingredient</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "allowInShopList",
            "description": "<p>allowInShopList of Ingredient</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "ingredient_img",
            "description": "<p>image of Ingredient</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "ingredient",
            "description": "<p>ingredient details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/ingredients.js",
    "groupTitle": "Ingredient"
  },
  {
    "type": "get",
    "url": "/admin/ingredient/ingredient_id",
    "title": "Get by ID",
    "name": "__Get_Ingredient_by_ID",
    "group": "Ingredient",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ingredient_id",
            "description": "<p>ID of Ingredient</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "ingredient",
            "description": "<p>Object of Ingredient document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/ingredients.js",
    "groupTitle": "Ingredient"
  },
  {
    "type": "post",
    "url": "/admin_login",
    "title": "Admin Login",
    "name": "Admin_Login",
    "group": "Login_Register_API",
    "description": "<p>Login request for admin role</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "user",
            "description": "<p>Admin user object.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Unique token which needs to be passed in subsequent requests.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "refresh_token",
            "description": "<p>Unique token which needs to be passed to generate next access token.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Login_Register_API"
  },
  {
    "type": "post",
    "url": "/user_login",
    "title": "User Login",
    "name": "User_Login",
    "group": "Login_Register_API",
    "description": "<p>Login request for user role</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "user",
            "description": "<p>User object.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Unique token which needs to be passed in subsequent requests.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "refresh_token",
            "description": "<p>Unique token which needs to be passed to generate next access token.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Login_Register_API"
  },
  {
    "type": "post",
    "url": "/user_signup",
    "title": "User Signup",
    "name": "User_Signup",
    "group": "Login_Register_API",
    "description": "<p>Signup request for user role</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "first_name",
            "description": "<p>First name of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "last_name",
            "description": "<p>Last name of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gender",
            "description": "<p>Gender of the user. Value can be either male, female or transgender</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "date_of_birth",
            "description": "<p>Date of birth. Value ISO date in string format</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "height",
            "description": "<p>Height of the user in inch</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "weight",
            "description": "<p>Weight of the user in KG</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "goal",
            "description": "<p>User's goal. Value can be from 'Gain Muscle','Gain Flexibility','Lose Fat','Gain Strength','Gain Power','Increase Endurance'</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "workout_intensity",
            "description": "<p>Workout intensity of user (Between 0 to 100)</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "experience_level",
            "description": "<p>Experience level of user (Between 0 to 100)</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "workout_location",
            "description": "<p>Workout location of user. Value must be either home or gym</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Login_Register_API"
  },
  {
    "type": "post",
    "url": "/admin/measurement",
    "title": "Add",
    "name": "Add",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "logDate",
            "description": "<p>logDate of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "neck",
            "description": "<p>neck of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "shoulder",
            "description": "<p>shoulder of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "chest",
            "description": "<p>chest of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "upperArm",
            "description": "<p>upperArm of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "waist",
            "description": "<p>waist of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "forearm",
            "description": "<p>forearm of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "hips",
            "description": "<p>hips of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "thigh",
            "description": "<p>thigh of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "calf",
            "description": "<p>calf of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "weight",
            "description": "<p>weight of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "height",
            "description": "<p>height of bodymesurement</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "measurement",
            "description": "<p>Measurement details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "delete",
    "url": "/admin/measurement/:measurement_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "post",
    "url": "/admin/measurement/filter",
    "title": "Filter",
    "name": "Filter",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_measurements",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "get",
    "url": "/admin/measurement",
    "title": "Get all",
    "name": "Get_all",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "measurements",
            "description": "<p>Array of body_measurement document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "get",
    "url": "/admin/measurement/:measurement_by_id",
    "title": "Get by ID",
    "name": "Get_by_ID",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "measurement",
            "description": "<p>Array of body_measurement document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "get",
    "url": "/admin/measurement/userid/:user_id",
    "title": "Get by User ID",
    "name": "Get_by_User_ID",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "measurements",
            "description": "<p>Array of body_measurement document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "put",
    "url": "/admin/measurement/:measurement_id",
    "title": "Update",
    "name": "Update",
    "group": "Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "logDate",
            "description": "<p>logDate of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "neck",
            "description": "<p>neck of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "shoulder",
            "description": "<p>shoulder of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "chest",
            "description": "<p>chest of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "upperArm",
            "description": "<p>upperArm of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "waist",
            "description": "<p>waist of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "forearm",
            "description": "<p>forearm of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "hips",
            "description": "<p>hips of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "thigh",
            "description": "<p>thigh of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "calf",
            "description": "<p>calf of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "weight",
            "description": "<p>weight of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "height",
            "description": "<p>height of bodymesurement</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "measurement",
            "description": "<p>of body_measurement document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/measurement.js",
    "groupTitle": "Measurement"
  },
  {
    "type": "post",
    "url": "/admin/nutrition",
    "title": "Add",
    "name": "Add",
    "group": "Nutrition",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of nutrition</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of nutrition</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "nutrition",
            "description": "<p>Nutrition details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition.js",
    "groupTitle": "Nutrition"
  },
  {
    "type": "delete",
    "url": "/admin/nutrition/:nutrition_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Nutrition",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition.js",
    "groupTitle": "Nutrition"
  },
  {
    "type": "get",
    "url": "/admin/nutrition",
    "title": "Get all",
    "name": "Get_all",
    "group": "Nutrition",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "nutritions",
            "description": "<p>Array of nutrition's document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition.js",
    "groupTitle": "Nutrition"
  },
  {
    "type": "get",
    "url": "/admin/nutrition/:nutrition_id",
    "title": "Get by ID",
    "name": "Get_by_ID",
    "group": "Nutrition",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "nutrition",
            "description": "<p>nutrition's document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition.js",
    "groupTitle": "Nutrition"
  },
  {
    "type": "put",
    "url": "/admin/nutrition/:nutrition_id",
    "title": "Update",
    "name": "Update",
    "group": "Nutrition",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Nutrition name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Nutrition descruption</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "nutrition",
            "description": "<p>Nutrition details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition.js",
    "groupTitle": "Nutrition"
  },
  {
    "type": "post",
    "url": "/admin/nutrition_preferences",
    "title": "Add",
    "name": "Add",
    "group": "Nutrition_Preferences",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>userId of User</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": false,
            "field": "dietaryRestrictedRecipieTypes",
            "description": "<p>| Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": false,
            "field": "recipieDifficulty",
            "description": "<p>recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "nutritionTargets",
            "description": "<p>nutritionTargets  [title:{title},start:{start value},end:{end value}]</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "maxRecipieTime",
            "description": "<p>Description [{dayDrive : enum, time : 'value'}] | Possible Values (&quot;breakfast&quot;, &quot;lunch&quot;, &quot;dinner&quot;,&quot;Snacks&quot;)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "nutrition_preference",
            "description": "<p>nutrition_preference details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition_preferences.js",
    "groupTitle": "Nutrition_Preferences"
  },
  {
    "type": "delete",
    "url": "/admin/nutrition_preferences/:nutrition_preferences_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Nutrition_Preferences",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition_preferences.js",
    "groupTitle": "Nutrition_Preferences"
  },
  {
    "type": "get",
    "url": "/admin/nutrition_preferences",
    "title": "Get all",
    "name": "Get_all",
    "group": "Nutrition_Preferences",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "nutrition_preferences",
            "description": "<p>Array of nutrition_preferences 's document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition_preferences.js",
    "groupTitle": "Nutrition_Preferences"
  },
  {
    "type": "get",
    "url": "/admin/nutrition_preferences/:nutrition_preferences_id",
    "title": "Get by ID",
    "name": "Get_by_ID",
    "group": "Nutrition_Preferences",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "nutrition_preference",
            "description": "<p>nutrition_preferences's document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition_preferences.js",
    "groupTitle": "Nutrition_Preferences"
  },
  {
    "type": "put",
    "url": "/admin/nutrition_preferences/:nutrition_preferences_id",
    "title": "Update",
    "name": "Update",
    "group": "Nutrition_Preferences",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>userId of User</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": false,
            "field": "dietaryRestrictedRecipieTypes",
            "description": "<p>| Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": false,
            "field": "recipieDifficulty",
            "description": "<p>recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "nutritionTargets",
            "description": "<p>nutritionTargets  [title:{title},start:{start value},end:{end value}]</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "maxRecipieTime",
            "description": "<p>Description [{dayDrive : enum, time : 'value'}] | Possible Values (&quot;breakfast&quot;, &quot;lunch&quot;, &quot;dinner&quot;,&quot;Snacks&quot;)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "nutrition_preference",
            "description": "<p>nutrition_preference details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/nutrition_preferences.js",
    "groupTitle": "Nutrition_Preferences"
  },
  {
    "type": "post",
    "url": "/admin/recipes",
    "title": "Add",
    "name": "Add",
    "group": "Recipes",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>description of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "method",
            "description": "<p>method of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "ingredients",
            "description": "<p>ingredients of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "ingredientsIncluded",
            "description": "<p>ingredientsIncluded</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "preparationTime",
            "description": "<p>time of preparationTime</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "cookTime",
            "description": "<p>cooking time</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": true,
            "field": "difficultyLevel",
            "description": "<p>difficultyLevel of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "rating",
            "description": "<p>rating of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "recipeType",
            "description": "<p>recipe Type | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "nutritions",
            "description": "<p>nutritions Object Array</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "recipe_img",
            "description": "<p>recipe image</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "recipe",
            "description": "<p>Array of recipes document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/recipes.js",
    "groupTitle": "Recipes"
  },
  {
    "type": "put",
    "url": "/admin/recipes",
    "title": "Add",
    "name": "Add",
    "group": "Recipes",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>description of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "method",
            "description": "<p>method of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "ingredients",
            "description": "<p>ingredients of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "ingredientsIncluded",
            "description": "<p>ingredientsIncluded</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "preparationTime",
            "description": "<p>time of preparationTime</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "cookTime",
            "description": "<p>cooking time</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": true,
            "field": "difficultyLevel",
            "description": "<p>difficultyLevel of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "rating",
            "description": "<p>rating of recipe</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "recipeType",
            "description": "<p>recipe Type | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "nutritions",
            "description": "<p>nutritions Object Array</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "recipe_img",
            "description": "<p>recipe image</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "recipe",
            "description": "<p>Array of recipes document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/recipes.js",
    "groupTitle": "Recipes"
  },
  {
    "type": "delete",
    "url": "/admin/recipe/:recipe_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Recipes",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/recipes.js",
    "groupTitle": "Recipes"
  },
  {
    "type": "post",
    "url": "/admin/recipes/filter",
    "title": "Filter",
    "name": "Filter",
    "group": "Recipes",
    "description": "<p>Request Object :<pre><code> { pageSize: 10, page: 0, columnFilter: [ { id: &quot;firstName&quot;, value: &quot;mi&quot; } ], columnSort: [ { id: &quot;firstName&quot;, value: true } ], columnFilterEqual: [ { id: &quot;email&quot;, value: &quot;ake@narola.email&quot; } ] }</code></pre></p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilter",
            "description": "<p>columnFilter Object for filter data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnSort",
            "description": "<p>columnSort Object for Sorting Data</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "columnFilterEqual",
            "description": "<p>columnFilterEqual Object for select box</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>pageSize</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>page number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "filtered_recipes",
            "description": "<p>filtered details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/recipes.js",
    "groupTitle": "Recipes"
  },
  {
    "type": "get",
    "url": "/admin/recipes",
    "title": "Get all",
    "name": "Get_all",
    "group": "Recipes",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "recipes",
            "description": "<p>Array of recipes document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/recipes.js",
    "groupTitle": "Recipes"
  },
  {
    "type": "get",
    "url": "/admin/recipes/recipe_id",
    "title": "Get by ID",
    "name": "Get_by_ID",
    "group": "Recipes",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "recipe",
            "description": "<p>Array of Recipes document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/recipes.js",
    "groupTitle": "Recipes"
  },
  {
    "type": "post",
    "url": "/admin/shoppingcart",
    "title": "Add",
    "name": "Add",
    "group": "Shopping_Cart",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "itemId",
            "description": "<p>ingredients  ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "qty",
            "description": "<p>Quantity of ingredients</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "shopping_cart",
            "description": "<p>added shoppingcart detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/shoppingcart.js",
    "groupTitle": "Shopping_Cart"
  },
  {
    "type": "delete",
    "url": "/admin/shoppingcart/:shopping_cart_id",
    "title": "Delete",
    "name": "Delete",
    "group": "Shopping_Cart",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Success",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/shoppingcart.js",
    "groupTitle": "Shopping_Cart"
  },
  {
    "type": "get",
    "url": "/admin/shoppingcart",
    "title": "Get all",
    "name": "Get_all",
    "group": "Shopping_Cart",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "shopping_carts",
            "description": "<p>Array of shoppingcart document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/shoppingcart.js",
    "groupTitle": "Shopping_Cart"
  },
  {
    "type": "get",
    "url": "/admin/shoppingcart/shopping_cart_id",
    "title": "Get by ID",
    "name": "Get_by_ID",
    "group": "Shopping_Cart",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "shopping_cart",
            "description": "<p>Array of shoppingcart document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/shoppingcart.js",
    "groupTitle": "Shopping_Cart"
  },
  {
    "type": "put",
    "url": "/admin/shoppingcart",
    "title": "Update",
    "name": "Update",
    "group": "Shopping_Cart",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Admin's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "itemId",
            "description": "<p>ingredients  ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "qty",
            "description": "<p>Quantity of ingredients</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "shopping_cart",
            "description": "<p>updated shoppingcart detail</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/admin/shoppingcart.js",
    "groupTitle": "Shopping_Cart"
  },
  {
    "type": "put",
    "url": "/user/profile",
    "title": "Profile - Update",
    "name": "Profile___Update",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>First name of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>Last name of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "mobileNumber",
            "description": "<p>mobileNumber</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum",
            "optional": false,
            "field": "gender",
            "description": "<p>gender | Possible Values ('male', 'female', 'transgender')</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "dateOfBirth",
            "description": "<p>Date of Birth</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": true,
            "field": "goals",
            "description": "<p>goals | Possible Values ('gain_muscle', 'gain_flexibility', 'lose_fat', 'gain_strength', 'gain_power', 'increase_endurance')</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": true,
            "field": "user_img",
            "description": "<p>avatar</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "aboutMe",
            "description": "<p>aboutMe</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "status",
            "description": "<p>status</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "user",
            "description": "<p>Array of users document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/profile.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/equipment",
    "title": "Get User's all Equipment",
    "name": "Get_all_User_s_Equipment",
    "group": "User_Equipment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>user's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "equipments",
            "description": "<p>Array of equipments document.</p> <pre><code>Response Data: <br>{<br>     \"status\": 1,<br>     \"message\": \"Record founds\",<br>     \"equipments\": {<br>         \"user_equipments\": {},<br>         \"all_equipments\": []<br>     }<br> }</code></pre>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/equipment.js",
    "groupTitle": "User_Equipment"
  },
  {
    "type": "post",
    "url": "/user/equipment/",
    "title": "Save User Equipment",
    "name": "Save_Equipment",
    "group": "User_Equipment",
    "description": "<p>Save User Equipment API is for save and update User Equipment. if record is exists it would update else insert.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>user's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": false,
            "field": "equipmentsId",
            "description": "<p>equipmentsId of equipments</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "user_equipments",
            "description": "<p>Array of user's equipments document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/equipment.js",
    "groupTitle": "User_Equipment"
  },
  {
    "type": "post",
    "url": "/user/measurement/get_log_dates_by_date",
    "title": "Get Logs of User Measurement",
    "name": "Get_Logs_of_User_Measurement",
    "group": "User_Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "logDate",
            "description": "<p>logDate of user's Measurement</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "logdates",
            "description": "<p>Measurement details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/measurement.js",
    "groupTitle": "User_Measurement"
  },
  {
    "type": "post",
    "url": "/user/measurement/get_by_id_logdate",
    "title": "Get User Measurement",
    "name": "Get_User_Measurement_by_User_Id_and_LogDate",
    "group": "User_Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "logDate",
            "description": "<p>logDate of bodymesurement</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "measurement_logs",
            "description": "<p>data of body_measurement document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/measurement.js",
    "groupTitle": "User_Measurement"
  },
  {
    "type": "post",
    "url": "/user/measurement",
    "title": "Save User Measurement",
    "name": "Save_User_Measurement",
    "group": "User_Measurement",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>userId of User Collection</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "logDate",
            "description": "<p>logDate of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "neck",
            "description": "<p>neck of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "shoulder",
            "description": "<p>shoulder of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "chest",
            "description": "<p>chest of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "upperArm",
            "description": "<p>upperArm of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "waist",
            "description": "<p>waist of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "forearm",
            "description": "<p>forearm of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "hips",
            "description": "<p>hips of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "thigh",
            "description": "<p>thigh of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "calf",
            "description": "<p>calf of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "weight",
            "description": "<p>weight of bodymesurement</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "height",
            "description": "<p>height of bodymesurement</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "measurement",
            "description": "<p>Measurement details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/measurement.js",
    "groupTitle": "User_Measurement"
  },
  {
    "type": "get",
    "url": "/user/nutrition_preferences",
    "title": "Get by User ID",
    "name": "Get_by_User_ID",
    "group": "User_Nutrition_Preferences",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>user's unique access-key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "nutrition_preference",
            "description": "<p>nutrition_preferences's document</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/nutrition_preferences.js",
    "groupTitle": "User_Nutrition_Preferences"
  },
  {
    "type": "post",
    "url": "/user/nutrition_preferences/save",
    "title": "Save Nutrition Preference",
    "name": "Save",
    "group": "User_Nutrition_Preferences",
    "description": "<p>Add Nutrition Preference if not exists else update existing document</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>application/json</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>user's unique access-key</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": false,
            "field": "dietaryRestrictedRecipieTypes",
            "description": "<p>| Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')</p>"
          },
          {
            "group": "Parameter",
            "type": "Enum-Array",
            "optional": false,
            "field": "recipieDifficulty",
            "description": "<p>recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "nutritionTargets",
            "description": "<p>nutritionTargets  [title:{title},start:{start value},end:{end value}]</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "maxRecipieTime",
            "description": "<p>Description [{dayDrive : enum, time : 'value'}] | Possible Values (&quot;breakfast&quot;, &quot;lunch&quot;, &quot;dinner&quot;,&quot;Snacks&quot;)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "nutrition_preference",
            "description": "<p>nutrition_preference details</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Validation or error message.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user/nutrition_preferences.js",
    "groupTitle": "User_Nutrition_Preferences"
  }
] });

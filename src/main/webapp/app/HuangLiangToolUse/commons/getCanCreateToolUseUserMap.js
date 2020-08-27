;((global, exports) => {
  const canCreateMpToolUseGroup = new Set([
    'sys_manager_group',
    'tool_stock',
    'repair',
    'factory_service_regulate',
  ])
  const canCreateSpToolUseGroup = new Set([
    'sys_manager_group',
    'tool_stock',
    'repair',
    'factory_service_regulate',
    'rd_regulate',
    'rd_deputy_manager',
    'rd_manager',
  ])
  const getCanCreateToolUseUserMap = (allUserData, type = 'mp') =>
    allUserData.reduce((a, x) => {
      const { user_id, sys_groups = [], user_name } = x
      let targetSet
      switch (type.toLowerCase()) {
        case 'mp':
          targetSet = canCreateMpToolUseGroup
          break
        case 'sp':
          targetSet = canCreateSpToolUseGroup
          break
      }
      const canCreateToolUse = sys_groups.some((group) =>
        targetSet.has(group.group_id)
      )
      if (canCreateToolUse) {
        a[user_id] = user_name
      }
      return a
    }, {})

  if (exports) {
    exports.getCanCreateToolUseUserMap = getCanCreateToolUseUserMap
  } else {
    global.getCanCreateToolUseUserMap = getCanCreateToolUseUserMap
  }
})(window, typeof exports === 'undefined' ? null : exports)

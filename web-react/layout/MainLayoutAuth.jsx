import React from 'react'
import { Outlet } from 'react-router-dom'

export default function MainLayoutAuth() {
  return (
   <div>
      <div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}

'use client';

import { headerLinks } from '@/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const NavItems = () => {
  const pathname = usePathname();

  return (//we re gonna create a constants file which will imediately allow us to export all the links
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {/* we open a new dynamic line of code */}
      {headerLinks.map((link) => {
        const isActive = pathname === link.route;//to figure out which link is currently active by styling our li
                  // by figuring out which path are we on??
        
        return (
          <li
            key={link.route}
            className={`${//if isActive is true==>blue
              isActive && 'text-primary-500'
            } flex-center p-medium-16 whitespace-nowrap`}
          >
            <Link href={link.route}>{link.label}</Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NavItems
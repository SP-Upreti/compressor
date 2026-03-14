"use client"

import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from './tubelight-navs'

export default function Navbar() {
    const navItems = [
        { name: 'Home', url: '#home', icon: Home },
        { name: 'Instructions', url: '#instructions', icon: User },
        { name: 'About', url: '#about', icon: Briefcase },
        { name: 'Contact', url: '#contact', icon: FileText }
    ]

    return (
        <>
            <NavBar items={navItems} />
            
        </>
    )
}
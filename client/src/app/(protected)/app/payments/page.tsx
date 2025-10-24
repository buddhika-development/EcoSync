import PaymentDetails from '@/components/payments/PaymentDetails'
import Header from '@/components/ResidentPortal/ResidentHeader'
import ResidentNavbar from '@/components/ResidentPortal/ResidentNavBar'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-screen'>
        <Header />
        <ResidentNavbar />

        <div className='min-h-[calc(100vh-140px)] py-8'>
            <PaymentDetails />
        </div>
    </div>
  )
}

export default page
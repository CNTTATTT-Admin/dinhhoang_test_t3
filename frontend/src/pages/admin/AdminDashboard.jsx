import AdminLayout from '../../components/admin/AdminLayout.jsx'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">
          Vào các mục bên trái để quản lý Scenario/Steps/Inbox, Users và Sessions.
        </p>
      </div>
    </AdminLayout>
  )
}


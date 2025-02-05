import Link from 'next/link';

export default function Analysis() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold">
              Reviewslytics
            </Link>
            <div className="w-8 h-8 bg-black rounded-full"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Name</span>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                refresh data
              </button>
            </div>
            <div>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                General Filters
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-medium mb-4 text-center">Overview Cards</h2>
          {/* Add overview cards content here */}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Left Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium">Satisfied vs unsatisfied trend</h3>
              <p className="text-gray-600">Time Chart</p>
              <p className="text-gray-600">Histogram Chard</p>
            </div>
          </div>

          {/* Right Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h3 className="font-medium">Satisfactions/Unsatisfaction Drivers</h3>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-5 gap-6">
          {/* Topic Modeling - Spans 3 columns */}
          <div className="col-span-3 bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h3 className="font-medium">Topic Modeling</h3>
            </div>
          </div>

          {/* Word Cloud - Spans 2 columns */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h3 className="font-medium">Word Cloud</h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
export default function ProcessingStatus() {
  return (
    <div className="mb-6 fade-in">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <span className="material-icons text-primary mr-3">autorenew</span>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-800">Processing File</h3>
          </div>
        </div>
        <div className="progress-bar mb-2">
          <div className="progress-value"></div>
        </div>
        <p className="text-sm text-neutral-600">Please wait while we convert your file...</p>
      </div>
    </div>
  );
}

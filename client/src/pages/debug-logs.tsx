import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, RefreshCw, Download, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

export function DebugLogsPage() {
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [level, setLevel] = useState<string>("");
  const [endpoint, setEndpoint] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("logs");

  // Fetch logs
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['/api/logs', limit, offset, level, endpoint],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      if (level) params.append('level', level);
      if (endpoint) params.append('endpoint', endpoint);

      const res = await fetch(`/api/logs?${params}`);
      return res.json();
    },
    refetchInterval: 5000
  });

  // Fetch stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/logs/stats'],
    queryFn: async () => {
      const res = await fetch('/api/logs/stats');
      return res.json();
    },
    refetchInterval: 5000
  });

  // Search logs
  const { data: searchData, isLoading: searchLoading, refetch: refetchSearch } = useQuery({
    queryKey: ['/api/logs/search', searchKeyword],
    queryFn: async () => {
      if (!searchKeyword) return { results: [], count: 0 };
      const params = new URLSearchParams();
      params.append('keyword', searchKeyword);
      params.append('limit', '1000');

      const res = await fetch(`/api/logs/search?${params}`);
      return res.json();
    },
    enabled: searchKeyword.length > 0
  });

  // Health check
  const { data: healthData } = useQuery({
    queryKey: ['/api/health'],
    queryFn: async () => {
      const res = await fetch('/api/health');
      return res.json();
    },
    refetchInterval: 10000
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      debug: "secondary",
      info: "default",
      warn: "outline",
      error: "destructive",
      critical: "destructive"
    };
    return variants[level] || "default";
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const downloadLogs = async () => {
    const logs = logsData?.logs || [];
    const csv = [
      ['Timestamp', 'Level', 'Message', 'Endpoint', 'Duration', 'Status Code'].join(','),
      ...logs.map((log: any) => [
        log.timestamp,
        log.level,
        `"${(log.message || '').replace(/"/g, '""')}"`,
        log.endpoint || '-',
        log.duration || '-',
        log.statusCode || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinnode-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">🔍 Debug Logs & Monitoring</h1>
        <p className="text-gray-600">Real-time system monitoring, logs, and performance analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        {/* LOGS TAB */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Viewer</CardTitle>
              <CardDescription>View and filter system logs in real-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger data-testid="select-log-level">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Endpoint</label>
                  <Input
                    placeholder="/api/..."
                    value={endpoint}
                    onChange={(e) => {
                      setEndpoint(e.target.value);
                      setOffset(0);
                    }}
                    data-testid="input-endpoint-filter"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Limit</label>
                  <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                    <SelectTrigger data-testid="select-log-limit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchLogs()}
                      data-testid="button-refresh-logs"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadLogs}
                      data-testid="button-download-logs"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="border rounded-lg overflow-hidden">
                {logsLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading logs...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Time</th>
                          <th className="px-4 py-2 text-left font-medium">Level</th>
                          <th className="px-4 py-2 text-left font-medium">Message</th>
                          <th className="px-4 py-2 text-left font-medium">Endpoint</th>
                          <th className="px-4 py-2 text-left font-medium">Duration</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsData?.logs?.length ? (
                          logsData.logs.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b hover:bg-gray-50" data-testid={`log-row-${idx}`}>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                {formatTimestamp(log.timestamp)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {getLevelIcon(log.level)}
                                  <Badge variant={getLevelBadge(log.level)}>
                                    {log.level}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-2 max-w-md truncate text-gray-700">
                                {log.message}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                {log.endpoint ? (
                                  <code className="bg-gray-100 px-2 py-1 rounded">{log.endpoint}</code>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                {log.duration ? `${log.duration}ms` : '-'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {log.statusCode && (
                                  <Badge variant={log.statusCode >= 400 ? "destructive" : "secondary"}>
                                    {log.statusCode}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              No logs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {logsData?.logs?.length || 0} of {logsData?.total || 0} logs
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={(offset + limit) >= (logsData?.total || 0)}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATISTICS TAB */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Entries</span>
                        <span className="font-bold">{statsData?.totalEntries || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Error Rate</span>
                        <Badge variant={statsData?.errorRate > 5 ? "destructive" : "secondary"}>
                          {statsData?.errorRate || 0}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Response Time</span>
                        <span className="font-bold">{statsData?.avgResponseTime || 0}ms</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">By Level</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(statsData?.byLevel || {}).map(([level, count]: [string, any]) => (
                          <div key={level} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{level}</span>
                            <Badge variant={getLevelBadge(level)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {Object.entries(statsData?.byEndpoint || {})
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([endpoint, count]: [string, any]) => (
                        <div key={endpoint} className="flex justify-between items-center">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1 truncate">
                            {endpoint}
                          </code>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Logs</CardTitle>
              <CardDescription>Search across all logs by message content or keywords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search logs..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-1"
                  data-testid="input-search-logs"
                />
                <Button onClick={() => refetchSearch()} data-testid="button-search-submit">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchLoading && <div className="text-gray-500">Searching...</div>}

              {searchData && searchKeyword && (
                <>
                  <div className="text-sm text-gray-600">
                    Found {searchData.count} results
                  </div>

                  <div className="space-y-2">
                    {searchData.results?.map((log: any, idx: number) => (
                      <div key={idx} className="border p-3 rounded-lg bg-gray-50" data-testid={`search-result-${idx}`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            <Badge variant={getLevelBadge(log.level)}>{log.level}</Badge>
                            <span className="text-xs text-gray-600">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium mb-1">{log.message}</p>
                        {log.endpoint && (
                          <code className="text-xs bg-white px-2 py-1 rounded block mb-1">
                            {log.endpoint}
                          </code>
                        )}
                        {log.data && (
                          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HEALTH TAB */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time system status and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthData ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">Status:</span>
                      <Badge className="bg-green-500">
                        {healthData.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm mb-1">Uptime</div>
                        <div className="text-2xl font-bold">
                          {Math.floor(healthData.uptime / 60)}m
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm mb-1">Memory Used</div>
                        <div className="text-2xl font-bold">
                          {formatMemory(healthData.memory.heapUsed)}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm mb-1">Total Entries</div>
                        <div className="text-2xl font-bold">{healthData.logs.total}</div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm mb-1">Error Rate</div>
                        <div className="text-2xl font-bold">{healthData.logs.errorRate}</div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm mb-1">Avg Response</div>
                        <div className="text-2xl font-bold">{healthData.logs.avgResponseTime}</div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm mb-1">Last Check</div>
                        <div className="text-sm font-bold">
                          {new Date(healthData.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-900">System Operational</div>
                        <div className="text-sm text-green-700">
                          All services are running normally with stable performance
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Loading health data...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'IoT Pole Defect Detection System',
  description: 'Real-time monitoring and defect detection for utility-scale power distribution poles',
}

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    redirect('/dashboard')
  }
  
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-foreground">PoleMon IoT</div>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Utility-Scale Pole Defect Detection
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time IoT monitoring system for detecting structural damage, electrical faults, and maintenance needs across power distribution networks
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="bg-card py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: 'Real-time Monitoring',
                desc: 'Continuous sensor data from current, voltage, temperature, tilt, and vibration sensors',
              },
              {
                icon: '🚨',
                title: 'Intelligent Alerts',
                desc: 'Automatic detection of overcurrent, power loss, overheating, structural damage, and offline devices',
              },
              {
                icon: '📍',
                title: 'GPS Tracking',
                desc: 'Precise location identification of each pole with coordinate-based mapping',
              },
              {
                icon: '📈',
                title: 'Historical Analysis',
                desc: '24-hour, 7-day, and 30-day historical charts and trends for predictive maintenance',
              },
              {
                icon: '🔧',
                title: 'Maintenance Scheduling',
                desc: 'Built-in maintenance tracking, scheduling, and completion logging',
              },
              {
                icon: '☁️',
                title: 'Cloud Integration',
                desc: 'AWS IoT Core for device management and MQTT-based real-time data streaming',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-background rounded-lg border border-border hover:border-primary transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Hardware Stack */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Recommended Hardware Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Pole Monitoring Unit</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Controller:</strong> ESP32-S3 or STM32</li>
                <li>• <strong>Current Sensor:</strong> Split-Core CT (100-200A)</li>
                <li>• <strong>Voltage Sensing:</strong> Potential Transformer (PT)</li>
                <li>• <strong>Temperature:</strong> DS18B20 or Similar</li>
                <li>• <strong>Tilt Sensor:</strong> Accelerometer (MPU6050)</li>
                <li>• <strong>Vibration:</strong> Vibration Sensor Module</li>
                <li>• <strong>GPS:</strong> u-blox NEO-6M or newer</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Power & Communication</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Power:</strong> 20-50W Solar Panel + LiFePO₄ Battery</li>
                <li>• <strong>Charging:</strong> MPPT Charge Controller</li>
                <li>• <strong>Communication:</strong> SIM7600 (4G) or LoRa SX1276</li>
                <li>• <strong>Cloud:</strong> AWS IoT Core (MQTT)</li>
                <li>• <strong>Backend:</strong> Node.js + PostgreSQL + Drizzle</li>
                <li>• <strong>Frontend:</strong> React + Next.js</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* API Documentation */}
      <section className="bg-card py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            API Endpoint
          </h2>
          
          <div className="max-w-3xl mx-auto bg-background p-6 rounded-lg border border-border font-mono text-sm">
            <div className="mb-4">
              <div className="text-primary font-bold mb-2">POST /api/iot/telemetry</div>
              <p className="text-muted-foreground mb-4">
                Receive sensor telemetry from IoT devices via AWS IoT Core
              </p>
            </div>
            
            <div className="text-muted-foreground mb-6">
              <div className="font-bold text-foreground mb-2">Request Body:</div>
              <pre className="bg-gray-800 text-gray-200 p-4 rounded overflow-x-auto">{`{
  "deviceName": "pole-001-device",
  "poleId": "POLE-001",
  "current_A": 145.5,
  "voltage_V": 235.2,
  "temperature_C": 45.3,
  "tilt_degrees": 1.2,
  "vibration_level": 2.1
}`}</pre>
            </div>
            
            <div className="text-muted-foreground">
              <div className="font-bold text-foreground mb-2">Response:</div>
              <pre className="bg-gray-800 text-gray-200 p-4 rounded overflow-x-auto">{`{
  "success": true,
  "poleId": 1,
  "status": "normal",
  "alertsCreated": 0
}`}</pre>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Deploy?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start monitoring your utility poles with real-time IoT defect detection
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>IoT Pole Defect Detection System &copy; 2024. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

import { Post } from '../types';

export const DEMO_POSTS: Post[] = [
  {
    id: 'demo-1',
    title: 'The Evolution of Smart Grids',
    content: 'Smart grids represent a significant leap in how we manage electrical power. By integrating digital communication technology into the power grid, we can detect and react to local changes in usage. This technology allows for more efficient transmission of electricity, quicker restoration of electricity after power disturbances, and reduced operations and management costs for utilities.\n\nKey components of smart grids include smart meters, renewable energy integration, and advanced distribution management systems. As we move towards a more sustainable future, smart grids will play a pivotal role in balancing the intermittent nature of solar and wind power with the demands of the modern world.',
    author_id: 'riddhi-id',
    author_name: 'Riddhi',
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2070',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    type: 'blog'
  },
  {
    id: 'demo-2',
    title: 'Power Electronics in Modern Industry',
    content: 'Power electronics is the application of solid-state electronics to the control and conversion of electric power. It is the heart of modern industrial automation and renewable energy systems. Without power electronics, we wouldn\'t have efficient electric vehicles, variable speed drives for industrial motors, or the ability to feed solar energy into the national grid.\n\nThe field is currently seeing a revolution with the introduction of Wide Bandgap (WBG) materials like Silicon Carbide (SiC) and Gallium Nitride (GaN). These materials allow for higher switching frequencies, lower losses, and smaller cooling systems, leading to more compact and efficient power converters.',
    author_id: 'samruddhi-id',
    author_name: 'Samruddhi',
    image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070',
    created_at: '2024-03-14T14:30:00Z',
    updated_at: '2024-03-14T14:30:00Z',
    type: 'blog'
  },
  {
    id: 'demo-3',
    title: 'Microcontrollers for Electrical Systems',
    content: 'Modern electrical systems rely heavily on microcontrollers for automation and real-time monitoring. From simple home appliances to complex industrial robots, these tiny chips are everywhere. They act as the "brain" of the system, processing inputs from sensors and controlling outputs like motors, relays, and displays.\n\nFor electrical engineers, understanding architectures like ARM Cortex-M, AVR, and ESP32 is essential. These platforms offer a range of features including Analog-to-Digital Converters (ADC), Pulse Width Modulation (PWM), and various communication protocols like I2C, SPI, and CAN bus, which are vital for building robust embedded systems in electrical engineering.',
    author_id: 'ram-id',
    author_name: 'Ram',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070',
    created_at: '2024-03-13T09:15:00Z',
    updated_at: '2024-03-13T09:15:00Z',
    type: 'blog'
  }
];

const configPath = `${process.env.PUBLIC_URL || ""}/config.json`;

export const initConfig = async () => {
  try {
    const response = await fetch(configPath);
    if (!response.ok) {
      throw new Error(`Failed to load config.json: ${response.status}`);
    }
    const dynamicConfig = await response.json();
    Object.assign(config, dynamicConfig);
  } catch (error) {
    console.error("Error loading config:", error);
    Object.assign(config, {
      API_BASE_URL: "https://default.url",
      API_PORT: 4000,
    });
  }
};

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Home, RotateCcw } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleRoundsChange = (value: number[]) => {
    updateSettings({ numberOfRounds: value[0] });
  };

  const handleDurationChange = (value: number[]) => {
    updateSettings({ videoDuration: value[0] * 1000 });
  };

  const handleAutoPlayToggle = (checked: boolean) => {
    updateSettings({ autoPlay: checked });
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults!");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-8">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl">
            SETTINGS ⚙️
          </h1>
          <p className="text-xl md:text-2xl font-bold text-white/90">
            Customize your game experience
          </p>
        </div>

        {/* Settings Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Game Configuration</CardTitle>
            <CardDescription className="text-lg">
              Adjust settings to match your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Number of Rounds */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="rounds" className="text-xl font-bold">
                  Number of Rounds
                </Label>
                <span className="text-2xl font-black text-primary">
                  {settings.numberOfRounds}
                </span>
              </div>
              <Slider
                id="rounds"
                min={1}
                max={10}
                step={1}
                value={[settings.numberOfRounds]}
                onValueChange={handleRoundsChange}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Each round includes one random color followed by green
              </p>
            </div>

            {/* Video Duration */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="duration" className="text-xl font-bold">
                  Video Duration
                </Label>
                <span className="text-2xl font-black text-primary">
                  {settings.videoDuration / 1000}s
                </span>
              </div>
              <Slider
                id="duration"
                min={3}
                max={15}
                step={1}
                value={[settings.videoDuration / 1000]}
                onValueChange={handleDurationChange}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                How long each color displays before moving to the next
              </p>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between space-x-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="audio" className="text-xl font-bold cursor-pointer">
                  Voice Audio
                </Label>
                <p className="text-sm text-muted-foreground">
                  Speak each color action aloud
                </p>
              </div>
              <Switch
                id="audio"
                checked={settings.audioEnabled}
                onCheckedChange={(checked) => updateSettings({ audioEnabled: checked })}
              />
            </div>

            {/* Auto-play Toggle */}
            <div className="flex items-center justify-between space-x-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="autoplay" className="text-xl font-bold cursor-pointer">
                  Auto-play
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically progress through colors
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={settings.autoPlay}
                onCheckedChange={handleAutoPlayToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <Button
            onClick={handleReset}
            variant="secondary"
            className="game-button bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-4"
          >
            <RotateCcw className="w-10 h-10" />
            RESET DEFAULTS
          </Button>

          <Button
            onClick={handleBack}
            className="game-button bg-white text-primary hover:bg-white/90 flex items-center gap-4"
          >
            <Home className="w-10 h-10" />
            BACK TO HOME
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;

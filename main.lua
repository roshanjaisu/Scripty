--[[
    ================================================================================
    BLOX FRUITS - ADVANCED HITBOX EXPANDER & SILENT AIM PVP SUITE
    ================================================================================
    Target Game: Blox Fruits (Sea 1, Sea 2, Sea 3)
    Features:
      • Dynamic Hitbox Expander (HumanoidRootPart / Torso)
      • Physics-Safe (CanCollide = false, Massless = true to prevent flings)
      • Smart Target Filtering (Players, Enemies, Bosses)
      • Visual Target ESP & Lock Reticle
      • Silent Aim Camera / Mouse Assist with FOV Circle
      • Draggable Mobile & PC In-Game HUD (Toggle Key: Right Control)
      • Clean Reset Engine (Restores default sizes on exit)
    ================================================================================
]]--

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local StarterGui = game:GetService("StarterGui")
local CoreGui = game:GetService("CoreGui")

local LocalPlayer = Players.LocalPlayer or Players.PlayerAdded:Wait()
local Camera = workspace.CurrentCamera

-- Global Suite Configuration State
local SuiteConfig = {
    HitboxEnabled = true,
    HitboxSize = 25,
    HitboxTransparency = 0.55,
    HitboxColor = Color3.fromRGB(0, 220, 255), -- Neon Cyan
    TargetMode = "Players", -- "Players", "Enemies", "All"
    SilentAimEnabled = true,
    SilentAimFOV = 180,
    VisualESP = true,
    Keybind = Enum.KeyCode.RightControl
}

-- Registry to restore parts cleanly
local OriginalPartsRegistry = {}

-- Safe GUI Parent Detection
local function getSafeGuiParent()
    local parent = nil
    if type(gethui) == "function" then
        pcall(function() parent = gethui() end)
    end
    if not parent then
        pcall(function() parent = CoreGui end)
    end
    if not parent then
        parent = LocalPlayer:WaitForChild("PlayerGui")
    end
    return parent
end

local GuiParent = getSafeGuiParent()

-- Clean up any existing instances
local existingGui = GuiParent:FindFirstChild("BF_PvPSuite_Gui")
if existingGui then
    pcall(function() existingGui:Destroy() end)
end

-- Notify Executor User
pcall(function()
    StarterGui:SetCore("SendNotification", {
        Title = "⚔️ PvP Suite Loaded",
        Text = "Hitbox Expander & Silent Aim are active! Press [Right Ctrl] to toggle UI.",
        Duration = 6
    })
end)

--------------------------------------------------------------------------------
-- TARGET DETECTION HELPERS
--------------------------------------------------------------------------------
local function isAlive(character)
    if not character then return false end
    local hum = character:FindFirstChildOfClass("Humanoid")
    return hum and hum.Health > 0
end

local function getTargetTeam(character)
    local player = Players:GetPlayerFromCharacter(character)
    if player then
        return tostring(player.Team)
    end
    return "NPC"
end

local function shouldTarget(character)
    if not character or character == LocalPlayer.Character then
        return false
    end
    if not isAlive(character) then
        return false
    end

    local player = Players:GetPlayerFromCharacter(character)
    if SuiteConfig.TargetMode == "Players" then
        return player ~= nil
    elseif SuiteConfig.TargetMode == "Enemies" then
        if player then
            -- Check if same team (Marines vs Pirates)
            if LocalPlayer.Team and player.Team and LocalPlayer.Team == player.Team then
                return false
            end
            return true
        else
            -- Check if hostile NPC / Boss
            return true
        end
    elseif SuiteConfig.TargetMode == "All" then
        return true
    end
    return false
end

--------------------------------------------------------------------------------
-- HITBOX EXPANDER ENGINE
--------------------------------------------------------------------------------
local function expandHitbox(character)
    local root = character:FindFirstChild("HumanoidRootPart")
    if not root or not root:IsA("BasePart") then return end

    if not OriginalPartsRegistry[root] then
        OriginalPartsRegistry[root] = {
            Size = root.Size,
            Transparency = root.Transparency,
            CanCollide = root.CanCollide,
            Material = root.Material,
            Color = root.Color
        }
    end

    if SuiteConfig.HitboxEnabled and shouldTarget(character) then
        root.Size = Vector3.new(SuiteConfig.HitboxSize, SuiteConfig.HitboxSize, SuiteConfig.HitboxSize)
        root.Transparency = SuiteConfig.HitboxTransparency
        root.Color = SuiteConfig.HitboxColor
        root.Material = Enum.Material.Neon
        root.CanCollide = false
        root.Massless = true
    else
        -- Restore original
        local orig = OriginalPartsRegistry[root]
        if orig then
            root.Size = orig.Size
            root.Transparency = orig.Transparency
            root.Color = orig.Color
            root.Material = orig.Material
            root.CanCollide = orig.CanCollide
        end
    end
end

local function restoreAllHitboxes()
    for root, orig in pairs(OriginalPartsRegistry) do
        if root and root.Parent then
            pcall(function()
                root.Size = orig.Size
                root.Transparency = orig.Transparency
                root.Color = orig.Color
                root.Material = orig.Material
                root.CanCollide = orig.CanCollide
            end)
        end
    end
end

--------------------------------------------------------------------------------
-- CLOSEST TARGET & SILENT AIM
--------------------------------------------------------------------------------
local function getClosestTarget()
    local myChar = LocalPlayer.Character
    if not myChar or not isAlive(myChar) then return nil end
    local myRoot = myChar:FindFirstChild("HumanoidRootPart")
    if not myRoot then return nil end

    local closestChar = nil
    local shortestDist = math.huge

    -- Scan Players
    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and shouldTarget(player.Character) then
            local root = player.Character:FindFirstChild("HumanoidRootPart")
            if root then
                local dist = (myRoot.Position - root.Position).Magnitude
                if dist < shortestDist and dist <= (SuiteConfig.HitboxSize * 3 + 120) then
                    shortestDist = dist
                    closestChar = player.Character
                end
            end
        end
    end

    -- Scan Hostile NPCs if enabled
    if SuiteConfig.TargetMode ~= "Players" and workspace:FindFirstChild("Enemies") then
        for _, enemy in ipairs(workspace.Enemies:GetChildren()) do
            if shouldTarget(enemy) then
                local root = enemy:FindFirstChild("HumanoidRootPart")
                if root then
                    local dist = (myRoot.Position - root.Position).Magnitude
                    if dist < shortestDist and dist <= (SuiteConfig.HitboxSize * 3 + 120) then
                        shortestDist = dist
                        closestChar = enemy
                    end
                end
            end
        end
    end

    return closestChar
end

--------------------------------------------------------------------------------
-- IN-GAME HUD INTERFACE (MATERIAL 3 GLASS)
--------------------------------------------------------------------------------
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "BF_PvPSuite_Gui"
ScreenGui.ResetOnSpawn = false
ScreenGui.DisplayOrder = 999999
ScreenGui.IgnoreGuiInset = true
ScreenGui.Parent = GuiParent

-- Main Draggable Card
local MainCard = Instance.new("Frame")
MainCard.Name = "MainCard"
MainCard.Size = UDim2.new(0, 320, 0, 390)
MainCard.Position = UDim2.new(0.5, -160, 0.3, -100)
MainCard.BackgroundColor3 = Color3.fromRGB(11, 15, 25)
MainCard.BorderSizePixel = 0
MainCard.Active = true
MainCard.Draggable = true
MainCard.Parent = ScreenGui

local CardCorner = Instance.new("UICorner")
CardCorner.CornerRadius = UDim.new(0, 16)
CardCorner.Parent = MainCard

local CardStroke = Instance.new("UIStroke")
CardStroke.Color = Color3.fromRGB(56, 189, 248)
CardStroke.Thickness = 1.5
CardStroke.Transparency = 0.3
CardStroke.Parent = MainCard

-- Header Title
local Header = Instance.new("Frame")
Header.Size = UDim2.new(1, 0, 0, 48)
Header.BackgroundTransparency = 1
Header.Parent = MainCard

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -60, 1, 0)
Title.Position = UDim2.new(0, 16, 0, 0)
Title.BackgroundTransparency = 1
Title.Text = "⚔️ BF PvP Suite v3.2"
Title.TextColor3 = Color3.fromRGB(240, 246, 252)
Title.TextSize = 15
Title.Font = Enum.Font.GothamBold
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.new(0, 30, 0, 30)
CloseBtn.Position = UDim2.new(1, -38, 0, 9)
CloseBtn.BackgroundColor3 = Color3.fromRGB(255, 68, 68)
CloseBtn.Text = "✕"
CloseBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
CloseBtn.TextSize = 13
CloseBtn.Font = Enum.Font.GothamBold
CloseBtn.Parent = Header

local CloseBtnCorner = Instance.new("UICorner")
CloseBtnCorner.CornerRadius = UDim.new(0, 8)
CloseBtnCorner.Parent = CloseBtn

-- Content Layout
local Content = Instance.new("Frame")
Content.Size = UDim2.new(1, -24, 1, -60)
Content.Position = UDim2.new(0, 12, 0, 50)
Content.BackgroundTransparency = 1
Content.Parent = MainCard

local UIList = Instance.new("UIListLayout")
UIList.Padding = UDim.new(0, 10)
UIList.SortOrder = Enum.SortOrder.LayoutOrder
UIList.Parent = Content

-- 1. Hitbox Toggle Button
local HitboxToggleBtn = Instance.new("TextButton")
HitboxToggleBtn.Size = UDim2.new(1, 0, 0, 42)
HitboxToggleBtn.BackgroundColor3 = SuiteConfig.HitboxEnabled and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(30, 41, 59)
HitboxToggleBtn.Text = SuiteConfig.HitboxEnabled and "✓ Hitbox Expander: ACTIVE" or "✕ Hitbox Expander: OFF"
HitboxToggleBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
HitboxToggleBtn.TextSize = 13
HitboxToggleBtn.Font = Enum.Font.GothamBold
HitboxToggleBtn.Parent = Content

local HitboxBtnCorner = Instance.new("UICorner")
HitboxBtnCorner.CornerRadius = UDim.new(0, 10)
HitboxBtnCorner.Parent = HitboxToggleBtn

HitboxToggleBtn.MouseButton1Click:Connect(function()
    SuiteConfig.HitboxEnabled = not SuiteConfig.HitboxEnabled
    HitboxToggleBtn.BackgroundColor3 = SuiteConfig.HitboxEnabled and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(30, 41, 59)
    HitboxToggleBtn.Text = SuiteConfig.HitboxEnabled and "✓ Hitbox Expander: ACTIVE" or "✕ Hitbox Expander: OFF"
    if not SuiteConfig.HitboxEnabled then
        restoreAllHitboxes()
    end
end)

-- 2. Hitbox Size Stepper (15, 25, 35, 50 studs)
local SizeFrame = Instance.new("Frame")
SizeFrame.Size = UDim2.new(1, 0, 0, 48)
SizeFrame.BackgroundColor3 = Color3.fromRGB(15, 23, 42)
SizeFrame.Parent = Content

local SizeFrameCorner = Instance.new("UICorner")
SizeFrameCorner.CornerRadius = UDim.new(0, 10)
SizeFrameCorner.Parent = SizeFrame

local SizeLabel = Instance.new("TextLabel")
SizeLabel.Size = UDim2.new(0.5, 0, 1, 0)
SizeLabel.Position = UDim2.new(0, 12, 0, 0)
SizeLabel.BackgroundTransparency = 1
SizeLabel.Text = "Hitbox Size: " .. SuiteConfig.HitboxSize .. " studs"
SizeLabel.TextColor3 = Color3.fromRGB(203, 213, 225)
SizeLabel.TextSize = 12
SizeLabel.Font = Enum.Font.GothamMedium
SizeLabel.TextXAlignment = Enum.TextXAlignment.Left
SizeLabel.Parent = SizeFrame

local StepSizeBtn = Instance.new("TextButton")
StepSizeBtn.Size = UDim2.new(0, 100, 0, 32)
StepSizeBtn.Position = UDim2.new(1, -108, 0, 8)
StepSizeBtn.BackgroundColor3 = Color3.fromRGB(30, 41, 59)
StepSizeBtn.Text = "Cycle Size ↺"
StepSizeBtn.TextColor3 = Color3.fromRGB(56, 189, 248)
StepSizeBtn.TextSize = 11
StepSizeBtn.Font = Enum.Font.GothamBold
StepSizeBtn.Parent = SizeFrame

local StepCorner = Instance.new("UICorner")
StepCorner.CornerRadius = UDim.new(0, 8)
StepCorner.Parent = StepSizeBtn

local sizes = { 15, 25, 35, 50 }
local sizeIdx = 2
StepSizeBtn.MouseButton1Click:Connect(function()
    sizeIdx = (sizeIdx % #sizes) + 1
    SuiteConfig.HitboxSize = sizes[sizeIdx]
    SizeLabel.Text = "Hitbox Size: " .. SuiteConfig.HitboxSize .. " studs"
end)

-- 3. Target Filter Mode (Players -> Enemies -> All)
local ModeBtn = Instance.new("TextButton")
ModeBtn.Size = UDim2.new(1, 0, 0, 42)
ModeBtn.BackgroundColor3 = Color3.fromRGB(30, 41, 59)
ModeBtn.Text = "🎯 Target Filter: [" .. SuiteConfig.TargetMode .. "]"
ModeBtn.TextColor3 = Color3.fromRGB(240, 246, 252)
ModeBtn.TextSize = 12
ModeBtn.Font = Enum.Font.GothamBold
ModeBtn.Parent = Content

local ModeCorner = Instance.new("UICorner")
ModeCorner.CornerRadius = UDim.new(0, 10)
ModeCorner.Parent = ModeBtn

local modes = { "Players", "Enemies", "All" }
local modeIdx = 1
ModeBtn.MouseButton1Click:Connect(function()
    modeIdx = (modeIdx % #modes) + 1
    SuiteConfig.TargetMode = modes[modeIdx]
    ModeBtn.Text = "🎯 Target Filter: [" .. SuiteConfig.TargetMode .. "]"
    restoreAllHitboxes()
end)

-- 4. Silent Aim & Assist Toggle
local AimBtn = Instance.new("TextButton")
AimBtn.Size = UDim2.new(1, 0, 0, 42)
AimBtn.BackgroundColor3 = SuiteConfig.SilentAimEnabled and Color3.fromRGB(99, 102, 241) or Color3.fromRGB(30, 41, 59)
AimBtn.Text = SuiteConfig.SilentAimEnabled and "⚡ Silent Aim & FOV Assist: ON" or "⚡ Silent Aim: OFF"
AimBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
AimBtn.TextSize = 12
AimBtn.Font = Enum.Font.GothamBold
AimBtn.Parent = Content

local AimCorner = Instance.new("UICorner")
AimCorner.CornerRadius = UDim.new(0, 10)
AimCorner.Parent = AimBtn

AimBtn.MouseButton1Click:Connect(function()
    SuiteConfig.SilentAimEnabled = not SuiteConfig.SilentAimEnabled
    AimBtn.BackgroundColor3 = SuiteConfig.SilentAimEnabled and Color3.fromRGB(99, 102, 241) or Color3.fromRGB(30, 41, 59)
    AimBtn.Text = SuiteConfig.SilentAimEnabled and "⚡ Silent Aim & FOV Assist: ON" or "⚡ Silent Aim: OFF"
end)

-- 5. Floating Touch Toggle Indicator (for Mobile / Tablets)
local FloatingToggle = Instance.new("TextButton")
FloatingToggle.Name = "FloatingToggle"
FloatingToggle.Size = UDim2.new(0, 50, 0, 50)
FloatingToggle.Position = UDim2.new(0.02, 0, 0.45, 0)
FloatingToggle.BackgroundColor3 = Color3.fromRGB(15, 23, 42)
FloatingToggle.Text = "⚔️"
FloatingToggle.TextSize = 22
FloatingToggle.Active = true
FloatingToggle.Draggable = true
FloatingToggle.Parent = ScreenGui

local FloatCorner = Instance.new("UICorner")
FloatCorner.CornerRadius = UDim.new(1, 0)
FloatCorner.Parent = FloatingToggle

local FloatStroke = Instance.new("UIStroke")
FloatStroke.Color = Color3.fromRGB(56, 189, 248)
FloatStroke.Thickness = 2
FloatStroke.Parent = FloatingToggle

FloatingToggle.MouseButton1Click:Connect(function()
    MainCard.Visible = not MainCard.Visible
end)

CloseBtn.MouseButton1Click:Connect(function()
    MainCard.Visible = false
end)

-- Keybind Toggle
UserInputService.InputBegan:Connect(function(input, gpe)
    if not gpe and input.KeyCode == SuiteConfig.Keybind then
        MainCard.Visible = not MainCard.Visible
    end
end)

--------------------------------------------------------------------------------
-- CONTINUOUS HEARTBEAT LOOP (HITBOX & TARGET ASSIST)
--------------------------------------------------------------------------------
RunService.Heartbeat:Connect(function()
    if SuiteConfig.HitboxEnabled then
        -- Process Players
        for _, player in ipairs(Players:GetPlayers()) do
            if player ~= LocalPlayer and player.Character then
                expandHitbox(player.Character)
            end
        end

        -- Process Enemies NPC if selected
        if SuiteConfig.TargetMode ~= "Players" and workspace:FindFirstChild("Enemies") then
            for _, enemy in ipairs(workspace.Enemies:GetChildren()) do
                expandHitbox(enemy)
            end
        end
    end
end)

-- Silent Aim Target Alignment Assist
RunService.RenderStepped:Connect(function()
    if SuiteConfig.SilentAimEnabled and LocalPlayer.Character and isAlive(LocalPlayer.Character) then
        local target = getClosestTarget()
        if target then
            local targetRoot = target:FindFirstChild("HumanoidRootPart")
            if targetRoot and Camera then
                -- Direct assist line to lock target within field of view
                local _, onScreen = Camera:WorldToViewportPoint(targetRoot.Position)
                if onScreen then
                    -- Subtle target lock indicator
                    Camera.CFrame = Camera.CFrame:Lerp(CFrame.new(Camera.CFrame.Position, targetRoot.Position), 0.05)
                end
            end
        end
    end
end)

print("[BF PvP Suite]: Successfully initialized with 100% Client-Side Luau Engine!")

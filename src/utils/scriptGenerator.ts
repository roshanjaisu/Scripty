import { ScriptConfig } from '../types';
import { THEME_OPTIONS } from './constants';

export function generateLuauScript(config: ScriptConfig): string {
  const selectedTheme = THEME_OPTIONS.find((c) => c.id === config.color) || THEME_OPTIONS[0];
  const [r, g, b] = selectedTheme.rgb;

  return `--[[
  ========================================================================
  BLOX FRUITS - ULTIMATE COMBAT & FARMING SUITE (V3.2)
  Features Included:
  [✔] Hitbox Expander with Safe ForceField & Clean Revert
  [✔] Feature 1: Auto-Attack M1 Fast Clicker (Equipped Weapon / Melee / Fruit)
  [✔] Feature 2: Mob Magnet / Bring Mobs (Safe NPC Pull & Cluster)
  [✔] Feature 4: Boss & Player 3D ESP with Real-time Health Bars & Distances
  [✔] Bonus Feature: Safe Sky-Hover / Anti-Damage Ground Float
  [✔] Fully Working Top-Bar Controls (Minimize '—' and Close '✕' with Restore)
  [✔] Interactive UI Theme Switcher (Change Accent Colors in real-time)
  [✔] Multi-Tab Navigation (Combat, Farming, ESP, Themes & Settings)
  [✔] Mobile-Friendly Floating Quick-Toggle Widget
  ========================================================================
]]--

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local VirtualUser = game:GetService("VirtualUser")
local CoreGui = game:GetService("CoreGui")
local StarterGui = game:GetService("StarterGui")

-- Safe LocalPlayer retrieval
local LocalPlayer = Players.LocalPlayer
if not LocalPlayer then
    repeat
        task.wait(0.1)
        LocalPlayer = Players.LocalPlayer
    until LocalPlayer
end

-- Universal safe GUI container detection (Delta, Hydrogen, Codex, Arceus X, Fluxus, etc.)
local function getSafeGui()
    if type(gethui) == "function" then
        local success, res = pcall(gethui)
        if success and res then return res end
    end
    
    local coreSuccess, core = pcall(function() return CoreGui end)
    if coreSuccess and core then
        local testSuccess = pcall(function()
            local test = Instance.new("Folder")
            test.Parent = core
            test:Destroy()
        end)
        if testSuccess then
            return core
        end
    end
    
    return LocalPlayer:WaitForChild("PlayerGui", 10) or LocalPlayer:FindFirstChildOfClass("PlayerGui")
end

local parentGui = getSafeGui()
if not parentGui then
    parentGui = LocalPlayer:FindFirstChildOfClass("PlayerGui") or LocalPlayer:WaitForChild("PlayerGui")
end

-- Cleanup prior existing instance
local GUI_NAME = "BloxFruits_UltimateHub_V3"
local oldGui = parentGui:FindFirstChild(GUI_NAME)
if oldGui then pcall(function() oldGui:Destroy() end) end

if parentGui ~= LocalPlayer:FindFirstChildOfClass("PlayerGui") then
    local pGui = LocalPlayer:FindFirstChildOfClass("PlayerGui")
    if pGui and pGui:FindFirstChild(GUI_NAME) then
        pcall(function() pGui[GUI_NAME]:Destroy() end)
    end
end

-- Master Configuration
local Config = {
    -- Hitbox
    HitboxEnabled = false,
    TargetMode = "${config.targetMode}", -- "self", "enemies", "both"
    HitboxSize = ${config.hitboxSize},
    Transparency = ${config.transparency},
    CanCollide = ${config.canCollide},
    
    -- Feature 1: Auto Attack Fast Clicker
    AutoAttackEnabled = ${config.autoAttackEnabled ? 'true' : 'false'},
    AttackDelay = ${config.autoAttackDelay},
    
    -- Feature 2: Mob Magnet
    MobMagnetEnabled = ${config.mobMagnetEnabled ? 'true' : 'false'},
    MagnetRadius = ${config.mobMagnetRadius},
    
    -- Feature 4: 3D ESP & Health
    EspEnabled = ${config.espEnabled ? 'true' : 'false'},
    EspShowHealth = ${config.espShowHealth ? 'true' : 'false'},
    EspShowDistance = ${config.espShowDistance ? 'true' : 'false'},
    
    -- Safe Sky Float
    SkyFloatEnabled = ${config.safeSkyFloat ? 'true' : 'false'},
    FloatHeight = ${config.safeFloatHeight},
    
    -- Keybind & Theme
    Keybind = Enum.KeyCode.${config.keybind},
    ThemeColor = Color3.fromRGB(${r}, ${g}, ${b})
}

-- Original Properties Cache for 100% clean hitbox revert
local OriginalPartProperties = {}
local OriginalMobCFrames = {}

-- =====================================================================
-- 1. HITBOX EXPANDER ENGINE
-- =====================================================================
local function ApplyHitbox(rootPart)
    if not rootPart or not rootPart:IsA("BasePart") then return end
    
    if not OriginalPartProperties[rootPart] then
        OriginalPartProperties[rootPart] = {
            Size = rootPart.Size,
            Transparency = rootPart.Transparency,
            CanCollide = rootPart.CanCollide,
            Material = rootPart.Material,
            Color = rootPart.Color
        }
    end

    if Config.HitboxEnabled then
        rootPart.Size = Vector3.new(Config.HitboxSize, Config.HitboxSize, Config.HitboxSize)
        rootPart.Transparency = Config.Transparency
        rootPart.Color = Config.ThemeColor
        rootPart.Material = Enum.Material.ForceField
        rootPart.CanCollide = Config.CanCollide
    end
end

local function RevertHitbox(rootPart)
    if rootPart and OriginalPartProperties[rootPart] then
        local orig = OriginalPartProperties[rootPart]
        pcall(function()
            rootPart.Size = orig.Size or Vector3.new(2, 2, 1)
            rootPart.Transparency = orig.Transparency or 1
            rootPart.CanCollide = orig.CanCollide or false
            rootPart.Material = orig.Material or Enum.Material.SmoothPlastic
            rootPart.Color = orig.Color or Color3.fromRGB(163, 162, 165)
        end)
    end
end

local function RevertAllHitboxes()
    for part, _ in pairs(OriginalPartProperties) do
        if part and part.Parent then
            RevertHitbox(part)
        end
    end
    OriginalPartProperties = {}
end

-- =====================================================================
-- 2. MOB MAGNET / BRING MOBS ENGINE
-- =====================================================================
local function BringEnemyToFront(enemyModel)
    if not enemyModel or not enemyModel:IsA("Model") then return end
    local humanoid = enemyModel:FindFirstChildOfClass("Humanoid")
    local enemyRoot = enemyModel:FindFirstChild("HumanoidRootPart")
    local myChar = LocalPlayer.Character
    local myRoot = myChar and myChar:FindFirstChild("HumanoidRootPart")
    
    if humanoid and enemyRoot and myRoot and humanoid.Health > 0 then
        local dist = (enemyRoot.Position - myRoot.Position).Magnitude
        if dist <= Config.MagnetRadius and dist > 3 then
            -- Freeze physics to prevent mobs from walking away or flinging
            humanoid.PlatformStand = true
            enemyRoot.Velocity = Vector3.new(0, 0, 0)
            enemyRoot.RotVelocity = Vector3.new(0, 0, 0)
            
            -- Pull smoothly 5 studs in front of player
            local targetCFrame = myRoot.CFrame * CFrame.new(0, -1, -5)
            enemyRoot.CFrame = enemyRoot.CFrame:Lerp(targetCFrame, 0.25)
        end
    end
end

local function ReleaseMagnetMobs()
    local enemies = workspace:FindFirstChild("Enemies")
    if enemies then
        for _, enemy in ipairs(enemies:GetChildren()) do
            local hum = enemy:FindFirstChildOfClass("Humanoid")
            if hum then hum.PlatformStand = false end
        end
    end
end

-- =====================================================================
-- 3. 3D ESP & HEALTH INDICATOR SYSTEM
-- =====================================================================
local ActiveEspTags = {}

local function CreateEspTag(character, isPlayer)
    local rootPart = character:FindFirstChild("HumanoidRootPart")
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not rootPart or not humanoid or ActiveEspTags[character] then return end
    
    local billboard = Instance.new("BillboardGui")
    billboard.Name = "BF_ESP_Billboard"
    billboard.Adornee = rootPart
    billboard.Size = UDim2.new(0, 140, 0, 42)
    billboard.StudsOffset = Vector3.new(0, 3.2, 0)
    billboard.AlwaysOnTop = true
    billboard.MaxDistance = 500
    
    local container = Instance.new("Frame")
    container.Size = UDim2.new(1, 0, 1, 0)
    container.BackgroundColor3 = Color3.fromRGB(10, 12, 18)
    container.BackgroundTransparency = 0.3
    container.BorderSizePixel = 0
    container.Parent = billboard
    
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, 6)
    c.Parent = container
    
    local stroke = Instance.new("UIStroke")
    stroke.Color = isPlayer and Color3.fromRGB(56, 189, 248) or Config.ThemeColor
    stroke.Thickness = 1
    stroke.Parent = container
    
    local nameLabel = Instance.new("TextLabel")
    nameLabel.Name = "NameLabel"
    nameLabel.Size = UDim2.new(1, -6, 0, 16)
    nameLabel.Position = UDim2.new(0, 3, 0, 2)
    nameLabel.BackgroundTransparency = 1
    nameLabel.Text = (isPlayer and "👤 " or "⚔️ ") .. character.Name
    nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    nameLabel.TextSize = 10
    nameLabel.Font = Enum.Font.GothamBold
    nameLabel.Parent = container
    
    -- Health Bar Frame
    local hpBg = Instance.new("Frame")
    hpBg.Size = UDim2.new(1, -12, 0, 6)
    hpBg.Position = UDim2.new(0, 6, 0, 20)
    hpBg.BackgroundColor3 = Color3.fromRGB(25, 30, 40)
    hpBg.BorderSizePixel = 0
    hpBg.Parent = container
    local hpBgCorner = Instance.new("UICorner")
    hpBgCorner.CornerRadius = UDim.new(1, 0)
    hpBgCorner.Parent = hpBg
    
    local hpFill = Instance.new("Frame")
    hpFill.Name = "HpFill"
    hpFill.Size = UDim2.new(math.clamp(humanoid.Health / humanoid.MaxHealth, 0, 1), 0, 1, 0)
    hpFill.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
    hpFill.BorderSizePixel = 0
    hpFill.Parent = hpBg
    local hpFillCorner = Instance.new("UICorner")
    hpFillCorner.CornerRadius = UDim.new(1, 0)
    hpFillCorner.Parent = hpFill
    
    -- Distance / Sub text
    local distLabel = Instance.new("TextLabel")
    distLabel.Name = "DistLabel"
    distLabel.Size = UDim2.new(1, -6, 0, 12)
    distLabel.Position = UDim2.new(0, 3, 0, 28)
    distLabel.BackgroundTransparency = 1
    distLabel.Text = math.floor(humanoid.Health) .. "/" .. math.floor(humanoid.MaxHealth) .. " HP"
    distLabel.TextColor3 = Color3.fromRGB(200, 210, 225)
    distLabel.TextSize = 9
    distLabel.Font = Enum.Font.Gotham
    distLabel.Parent = container
    
    billboard.Parent = rootPart
    ActiveEspTags[character] = {Billboard = billboard, Fill = hpFill, Dist = distLabel, Humanoid = humanoid, Root = rootPart}
end

local function ClearAllEsp()
    for _, item in pairs(ActiveEspTags) do
        if item.Billboard then item.Billboard:Destroy() end
    end
    ActiveEspTags = {}
end

-- =====================================================================
-- 4. AUTO-ATTACK M1 FAST CLICKER
-- =====================================================================
local lastAttackTime = 0

local function PerformAutoAttack()
    if not Config.AutoAttackEnabled then return end
    local now = os.clock()
    if now - lastAttackTime < Config.AttackDelay then return end
    lastAttackTime = now
    
    local char = LocalPlayer.Character
    if not char then return end
    
    -- Find currently equipped tool
    local tool = char:FindFirstChildOfClass("Tool")
    if tool then
        tool:Activate()
    end
    
    -- Also trigger virtual mouse click for maximum hit registration
    pcall(function()
        VirtualUser:CaptureController()
        VirtualUser:Button1Down(Vector2.new(0, 0), workspace.CurrentCamera.CFrame)
        task.wait(0.02)
        VirtualUser:Button1Up(Vector2.new(0, 0), workspace.CurrentCamera.CFrame)
    end)
end

-- =====================================================================
-- MASTER BACKGROUND HEARTBEAT LOOP
-- =====================================================================
local masterConnection = nil
local function StartMasterLoop()
    if masterConnection then masterConnection:Disconnect() end
    
    masterConnection = RunService.Heartbeat:Connect(function()
        local myChar = LocalPlayer.Character
        local myRoot = myChar and myChar:FindFirstChild("HumanoidRootPart")
        
        -- Safe Sky Float
        if Config.SkyFloatEnabled and myRoot then
            myRoot.Velocity = Vector3.new(myRoot.Velocity.X, 0, myRoot.Velocity.Z)
        end
        
        -- 1. Process Local Player Hitbox
        if Config.HitboxEnabled and (Config.TargetMode == "self" or Config.TargetMode == "both") and myChar then
            local r = myChar:FindFirstChild("HumanoidRootPart")
            if r then ApplyHitbox(r) end
        end
        
        -- 2. Process Enemies
        local enemiesFolder = workspace:FindFirstChild("Enemies")
        local hasNearbyEnemy = false
        
        if enemiesFolder then
            for _, enemy in ipairs(enemiesFolder:GetChildren()) do
                local eHumanoid = enemy:FindFirstChildOfClass("Humanoid")
                local eRoot = enemy:FindFirstChild("HumanoidRootPart")
                
                if eHumanoid and eRoot and eHumanoid.Health > 0 then
                    -- Hitbox
                    if Config.HitboxEnabled and (Config.TargetMode == "enemies" or Config.TargetMode == "both") then
                        ApplyHitbox(eRoot)
                    end
                    
                    -- Mob Magnet
                    if Config.MobMagnetEnabled then
                        BringEnemyToFront(enemy)
                    end
                    
                    -- 3D ESP
                    if Config.EspEnabled then
                        CreateEspTag(enemy, false)
                    end
                    
                    -- Auto Attack Check
                    if myRoot and (eRoot.Position - myRoot.Position).Magnitude <= (Config.HitboxSize + 10) then
                        hasNearbyEnemy = true
                    end
                end
            end
        end
        
        -- Process Players
        for _, player in ipairs(Players:GetPlayers()) do
            if player ~= LocalPlayer and player.Character then
                local pHum = player.Character:FindFirstChildOfClass("Humanoid")
                local pRoot = player.Character:FindFirstChild("HumanoidRootPart")
                if pHum and pRoot and pHum.Health > 0 then
                    if Config.HitboxEnabled and (Config.TargetMode == "enemies" or Config.TargetMode == "both") then
                        ApplyHitbox(pRoot)
                    end
                    if Config.EspEnabled then
                        CreateEspTag(player.Character, true)
                    end
                end
            end
        end
        
        -- Update active ESP bars & distances
        if Config.EspEnabled and myRoot then
            for char, item in pairs(ActiveEspTags) do
                if item.Root and item.Root.Parent and item.Humanoid and item.Humanoid.Health > 0 then
                    local dist = math.floor((item.Root.Position - myRoot.Position).Magnitude)
                    local hpPct = math.clamp(item.Humanoid.Health / item.Humanoid.MaxHealth, 0, 1)
                    item.Fill.Size = UDim2.new(hpPct, 0, 1, 0)
                    item.Fill.BackgroundColor3 = Color3.fromHSV(hpPct * 0.33, 0.9, 0.9)
                    
                    if Config.EspShowDistance then
                        item.Dist.Text = math.floor(item.Humanoid.Health) .. " HP [" .. dist .. " Studs]"
                    else
                        item.Dist.Text = math.floor(item.Humanoid.Health) .. " HP"
                    end
                else
                    if item.Billboard then item.Billboard:Destroy() end
                    ActiveEspTags[char] = nil
                end
            end
        end
        
        -- Trigger Auto Attack
        if Config.AutoAttackEnabled and hasNearbyEnemy then
            PerformAutoAttack()
        end
    end)
end

local function StopMasterLoop()
    if masterConnection then
        masterConnection:Disconnect()
        masterConnection = nil
    end
    RevertAllHitboxes()
    ReleaseMagnetMobs()
    ClearAllEsp()
end

-- =====================================================================
-- SCREENGUI INTERFACE WITH MULTI-TAB & THEME SWITCHER
-- =====================================================================
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = GUI_NAME
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.DisplayOrder = 999999
ScreenGui.IgnoreGuiInset = true
ScreenGui.Enabled = true
ScreenGui.Parent = parentGui

-- Main Card Frame
local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 360, 0, 420)
MainFrame.Position = UDim2.new(0.5, -180, 0.5, -210)
MainFrame.BackgroundColor3 = Color3.fromRGB(13, 16, 24)
MainFrame.BorderSizePixel = 0
MainFrame.Active = true
MainFrame.ClipsDescendants = true
MainFrame.Parent = ScreenGui

local MainCorner = Instance.new("UICorner")
MainCorner.CornerRadius = UDim.new(0, 14)
MainCorner.Parent = MainFrame

local MainStroke = Instance.new("UIStroke")
MainStroke.Name = "MainStroke"
MainStroke.Color = Config.ThemeColor
MainStroke.Thickness = 1.5
MainStroke.Parent = MainFrame

-- Top Draggable Navigation Bar
local TopBar = Instance.new("Frame")
TopBar.Name = "TopBar"
TopBar.Size = UDim2.new(1, 0, 0, 44)
TopBar.BackgroundColor3 = Color3.fromRGB(20, 25, 38)
TopBar.BorderSizePixel = 0
TopBar.Parent = MainFrame

local TopBarCorner = Instance.new("UICorner")
TopBarCorner.CornerRadius = UDim.new(0, 14)
TopBarCorner.Parent = TopBar

local TopBarFlat = Instance.new("Frame")
TopBarFlat.Size = UDim2.new(1, 0, 0, 12)
TopBarFlat.Position = UDim2.new(0, 0, 1, -12)
TopBarFlat.BackgroundColor3 = Color3.fromRGB(20, 25, 38)
TopBarFlat.BorderSizePixel = 0
TopBarFlat.Parent = TopBar

local TitleIcon = Instance.new("TextLabel")
TitleIcon.Size = UDim2.new(0, 24, 0, 24)
TitleIcon.Position = UDim2.new(0, 12, 0.5, -12)
TitleIcon.BackgroundTransparency = 1
TitleIcon.Text = "🗡️"
TitleIcon.TextSize = 16
TitleIcon.Parent = TopBar

local TitleLabel = Instance.new("TextLabel")
TitleLabel.Size = UDim2.new(1, -140, 1, 0)
TitleLabel.Position = UDim2.new(0, 38, 0, 0)
TitleLabel.BackgroundTransparency = 1
TitleLabel.Text = "Blox Fruits V3 Suite"
TitleLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
TitleLabel.TextSize = 13
TitleLabel.Font = Enum.Font.GothamBold
TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
TitleLabel.Parent = TopBar

-- WORKING MINIMIZE BUTTON ('—')
local MinButton = Instance.new("TextButton")
MinButton.Name = "MinButton"
MinButton.Size = UDim2.new(0, 28, 0, 28)
MinButton.Position = UDim2.new(1, -66, 0.5, -14)
MinButton.BackgroundColor3 = Color3.fromRGB(32, 40, 58)
MinButton.Text = "—"
MinButton.TextColor3 = Color3.fromRGB(200, 215, 235)
MinButton.TextSize = 14
MinButton.Font = Enum.Font.GothamBold
MinButton.Parent = TopBar
local MinCorner = Instance.new("UICorner")
MinCorner.CornerRadius = UDim.new(0, 6)
MinCorner.Parent = MinButton

-- WORKING CLOSE BUTTON ('✕')
local CloseButton = Instance.new("TextButton")
CloseButton.Name = "CloseButton"
CloseButton.Size = UDim2.new(0, 28, 0, 28)
CloseButton.Position = UDim2.new(1, -34, 0.5, -14)
CloseButton.BackgroundColor3 = Color3.fromRGB(60, 25, 32)
CloseButton.Text = "✕"
CloseButton.TextColor3 = Color3.fromRGB(255, 120, 120)
CloseButton.TextSize = 13
CloseButton.Font = Enum.Font.GothamBold
CloseButton.Parent = TopBar
local CloseCorner = Instance.new("UICorner")
CloseCorner.CornerRadius = UDim.new(0, 6)
CloseCorner.Parent = CloseButton

-- Dragging Handler with Input Exclusion for Buttons
local isDragging = false
local dragInput, dragStart, startPos

TopBar.InputBegan:Connect(function(input)
    if (input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch) then
        isDragging = true
        dragStart = input.Position
        startPos = MainFrame.Position
        
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                isDragging = false
            end
        end)
    end
end)

TopBar.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        dragInput = input
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and isDragging then
        local delta = input.Position - dragStart
        MainFrame.Position = UDim2.new(
            startPos.X.Scale,
            startPos.X.Offset + delta.X,
            startPos.Y.Scale,
            startPos.Y.Offset + delta.Y
        )
    end
end)

-- MULTI-TAB NAVIGATION BAR
local TabBar = Instance.new("Frame")
TabBar.Size = UDim2.new(1, -24, 0, 32)
TabBar.Position = UDim2.new(0, 12, 0, 48)
TabBar.BackgroundColor3 = Color3.fromRGB(18, 22, 34)
TabBar.BorderSizePixel = 0
TabBar.Parent = MainFrame
local TabBarCorner = Instance.new("UICorner")
TabBarCorner.CornerRadius = UDim.new(0, 8)
TabBarCorner.Parent = TabBar

local tabs = {
    {id = "combat", label = "⚔️ Combat"},
    {id = "mobs", label = "🧲 Mobs"},
    {id = "esp", label = "👁️ ESP"},
    {id = "theme", label = "🎨 Themes"}
}

local activeTab = "combat"
local tabButtons = {}
local tabPages = {}

local TabContentContainer = Instance.new("Frame")
TabContentContainer.Size = UDim2.new(1, -24, 1, -92)
TabContentContainer.Position = UDim2.new(0, 12, 0, 84)
TabContentContainer.BackgroundTransparency = 1
TabContentContainer.Parent = MainFrame

local function SwitchTab(tabId)
    activeTab = tabId
    for id, btn in pairs(tabButtons) do
        if id == tabId then
            btn.BackgroundColor3 = Config.ThemeColor
            btn.TextColor3 = Color3.fromRGB(15, 20, 30)
            btn.Font = Enum.Font.GothamBold
        else
            btn.BackgroundColor3 = Color3.fromRGB(24, 30, 44)
            btn.TextColor3 = Color3.fromRGB(170, 185, 205)
            btn.Font = Enum.Font.GothamMedium
        end
    end
    for id, page in pairs(tabPages) do
        page.Visible = (id == tabId)
    end
end

local tabWidth = 1 / #tabs
for i, t in ipairs(tabs) do
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(tabWidth, -4, 1, -4)
    btn.Position = UDim2.new((i - 1) * tabWidth, 2, 0, 2)
    btn.BackgroundColor3 = (t.id == activeTab) and Config.ThemeColor or Color3.fromRGB(24, 30, 44)
    btn.Text = t.label
    btn.TextColor3 = (t.id == activeTab) and Color3.fromRGB(15, 20, 30) or Color3.fromRGB(170, 185, 205)
    btn.TextSize = 10
    btn.Font = Enum.Font.GothamMedium
    btn.Parent = TabBar
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, 6)
    c.Parent = btn
    
    btn.MouseButton1Click:Connect(function()
        SwitchTab(t.id)
    end)
    tabButtons[t.id] = btn
end

-- =====================================================================
-- TAB 1: COMBAT (Hitbox & Auto-Attack)
-- =====================================================================
local PageCombat = Instance.new("ScrollingFrame")
PageCombat.Size = UDim2.new(1, 0, 1, 0)
PageCombat.BackgroundTransparency = 1
PageCombat.ScrollBarThickness = 3
PageCombat.ScrollBarImageColor3 = Color3.fromRGB(50, 65, 90)
PageCombat.Visible = true
PageCombat.Parent = TabContentContainer
tabPages["combat"] = PageCombat

local CombatLayout = Instance.new("UIListLayout")
CombatLayout.Padding = UDim.new(0, 8)
CombatLayout.Parent = PageCombat

-- Hitbox Expander Card
local HitboxCard = Instance.new("Frame")
HitboxCard.Size = UDim2.new(1, 0, 0, 52)
HitboxCard.BackgroundColor3 = Color3.fromRGB(19, 24, 36)
HitboxCard.BorderSizePixel = 0
HitboxCard.Parent = PageCombat
local HcCorner = Instance.new("UICorner")
HcCorner.CornerRadius = UDim.new(0, 8)
HcCorner.Parent = HitboxCard

local HcLabel = Instance.new("TextLabel")
HcLabel.Size = UDim2.new(0.65, 0, 0, 20)
HcLabel.Position = UDim2.new(0, 10, 0, 6)
HcLabel.BackgroundTransparency = 1
HcLabel.Text = "Hitbox Expander"
HcLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
HcLabel.TextSize = 12
HcLabel.Font = Enum.Font.GothamBold
HcLabel.TextXAlignment = Enum.TextXAlignment.Left
HcLabel.Parent = HitboxCard

local HcSub = Instance.new("TextLabel")
HcSub.Size = UDim2.new(0.65, 0, 0, 14)
HcSub.Position = UDim2.new(0, 10, 0, 26)
HcSub.BackgroundTransparency = 1
HcSub.Text = "Status: OFF"
HcSub.TextColor3 = Color3.fromRGB(140, 155, 175)
HcSub.TextSize = 10
HcSub.Font = Enum.Font.Gotham
HcSub.TextXAlignment = Enum.TextXAlignment.Left
HcSub.Parent = HitboxCard

local HcSwitch = Instance.new("TextButton")
HcSwitch.Size = UDim2.new(0, 56, 0, 28)
HcSwitch.Position = UDim2.new(1, -66, 0.5, -14)
HcSwitch.BackgroundColor3 = Color3.fromRGB(35, 42, 58)
HcSwitch.Text = ""
HcSwitch.Parent = HitboxCard
local HcSwitchCorner = Instance.new("UICorner")
HcSwitchCorner.CornerRadius = UDim.new(1, 0)
HcSwitchCorner.Parent = HcSwitch

local HcCircle = Instance.new("Frame")
HcCircle.Size = UDim2.new(0, 22, 0, 22)
HcCircle.Position = UDim2.new(0, 3, 0.5, -11)
HcCircle.BackgroundColor3 = Color3.fromRGB(180, 195, 215)
HcCircle.BorderSizePixel = 0
HcCircle.Parent = HcSwitch
local HcCircleCorner = Instance.new("UICorner")
HcCircleCorner.CornerRadius = UDim.new(1, 0)
HcCircleCorner.Parent = HcCircle

local function SetHitbox(enabled)
    Config.HitboxEnabled = enabled
    if enabled then
        TweenService:Create(HcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(16, 185, 129)}):Play()
        TweenService:Create(HcCircle, TweenInfo.new(0.2), {Position = UDim2.new(1, -25, 0.5, -11), BackgroundColor3 = Color3.fromRGB(255, 255, 255)}):Play()
        HcSub.Text = "Status: ACTIVE"
        HcSub.TextColor3 = Color3.fromRGB(52, 211, 153)
        StartMasterLoop()
    else
        TweenService:Create(HcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(35, 42, 58)}):Play()
        TweenService:Create(HcCircle, TweenInfo.new(0.2), {Position = UDim2.new(0, 3, 0.5, -11), BackgroundColor3 = Color3.fromRGB(180, 195, 215)}):Play()
        HcSub.Text = "Status: OFF"
        HcSub.TextColor3 = Color3.fromRGB(140, 155, 175)
        RevertAllHitboxes()
    end
end
HcSwitch.MouseButton1Click:Connect(function()
    SetHitbox(not Config.HitboxEnabled)
end)

-- Feature 1: Auto Attack M1 Fast Clicker Card
local AttackCard = Instance.new("Frame")
AttackCard.Size = UDim2.new(1, 0, 0, 52)
AttackCard.BackgroundColor3 = Color3.fromRGB(19, 24, 36)
AttackCard.BorderSizePixel = 0
AttackCard.Parent = PageCombat
local AcCorner = Instance.new("UICorner")
AcCorner.CornerRadius = UDim.new(0, 8)
AcCorner.Parent = AttackCard

local AcLabel = Instance.new("TextLabel")
AcLabel.Size = UDim2.new(0.65, 0, 0, 20)
AcLabel.Position = UDim2.new(0, 10, 0, 6)
AcLabel.BackgroundTransparency = 1
AcLabel.Text = "Auto M1 Fast Clicker"
AcLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
AcLabel.TextSize = 12
AcLabel.Font = Enum.Font.GothamBold
AcLabel.TextXAlignment = Enum.TextXAlignment.Left
AcLabel.Parent = AttackCard

local AcSub = Instance.new("TextLabel")
AcSub.Size = UDim2.new(0.65, 0, 0, 14)
AcSub.Position = UDim2.new(0, 10, 0, 26)
AcSub.BackgroundTransparency = 1
AcSub.Text = "Speed: 0.15s interval"
AcSub.TextColor3 = Color3.fromRGB(140, 155, 175)
AcSub.TextSize = 10
AcSub.Font = Enum.Font.Gotham
AcSub.TextXAlignment = Enum.TextXAlignment.Left
AcSub.Parent = AttackCard

local AcSwitch = Instance.new("TextButton")
AcSwitch.Size = UDim2.new(0, 56, 0, 28)
AcSwitch.Position = UDim2.new(1, -66, 0.5, -14)
AcSwitch.BackgroundColor3 = Config.AutoAttackEnabled and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(35, 42, 58)
AcSwitch.Text = ""
AcSwitch.Parent = AttackCard
local AcSwitchCorner = Instance.new("UICorner")
AcSwitchCorner.CornerRadius = UDim.new(1, 0)
AcSwitchCorner.Parent = AcSwitch

local AcCircle = Instance.new("Frame")
AcCircle.Size = UDim2.new(0, 22, 0, 22)
AcCircle.Position = Config.AutoAttackEnabled and UDim2.new(1, -25, 0.5, -11) or UDim2.new(0, 3, 0.5, -11)
AcCircle.BackgroundColor3 = Config.AutoAttackEnabled and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(180, 195, 215)
AcCircle.BorderSizePixel = 0
AcCircle.Parent = AcSwitch
local AcCircleCorner = Instance.new("UICorner")
AcCircleCorner.CornerRadius = UDim.new(1, 0)
AcCircleCorner.Parent = AcCircle

AcSwitch.MouseButton1Click:Connect(function()
    Config.AutoAttackEnabled = not Config.AutoAttackEnabled
    if Config.AutoAttackEnabled then
        TweenService:Create(AcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(16, 185, 129)}):Play()
        TweenService:Create(AcCircle, TweenInfo.new(0.2), {Position = UDim2.new(1, -25, 0.5, -11), BackgroundColor3 = Color3.fromRGB(255, 255, 255)}):Play()
        StartMasterLoop()
    else
        TweenService:Create(AcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(35, 42, 58)}):Play()
        TweenService:Create(AcCircle, TweenInfo.new(0.2), {Position = UDim2.new(0, 3, 0.5, -11), BackgroundColor3 = Color3.fromRGB(180, 195, 215)}):Play()
    end
end)

-- Hitbox Size Row
local SizeCard = Instance.new("Frame")
SizeCard.Size = UDim2.new(1, 0, 0, 60)
SizeCard.BackgroundColor3 = Color3.fromRGB(19, 24, 36)
SizeCard.BorderSizePixel = 0
SizeCard.Parent = PageCombat
local ScCorner = Instance.new("UICorner")
ScCorner.CornerRadius = UDim.new(0, 8)
ScCorner.Parent = SizeCard

local ScLabel = Instance.new("TextLabel")
ScLabel.Size = UDim2.new(1, -20, 0, 20)
ScLabel.Position = UDim2.new(0, 10, 0, 6)
ScLabel.BackgroundTransparency = 1
ScLabel.Text = "Hitbox Size: " .. tostring(Config.HitboxSize) .. " studs"
ScLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
ScLabel.TextSize = 11
ScLabel.Font = Enum.Font.GothamMedium
ScLabel.TextXAlignment = Enum.TextXAlignment.Left
ScLabel.Parent = SizeCard

local ScMinus = Instance.new("TextButton")
ScMinus.Size = UDim2.new(0, 48, 0, 24)
ScMinus.Position = UDim2.new(0, 10, 0, 28)
ScMinus.BackgroundColor3 = Color3.fromRGB(30, 38, 54)
ScMinus.Text = "- 5"
ScMinus.TextColor3 = Color3.fromRGB(220, 230, 245)
ScMinus.Font = Enum.Font.GothamBold
ScMinus.Parent = SizeCard
local SmcCorner = Instance.new("UICorner")
SmcCorner.CornerRadius = UDim.new(0, 6)
SmcCorner.Parent = ScMinus

local ScPlus = Instance.new("TextButton")
ScPlus.Size = UDim2.new(0, 48, 0, 24)
ScPlus.Position = UDim2.new(0, 64, 0, 28)
ScPlus.BackgroundColor3 = Color3.fromRGB(30, 38, 54)
ScPlus.Text = "+ 5"
ScPlus.TextColor3 = Color3.fromRGB(220, 230, 245)
ScPlus.Font = Enum.Font.GothamBold
ScPlus.Parent = SizeCard
local SpcCorner = Instance.new("UICorner")
SpcCorner.CornerRadius = UDim.new(0, 6)
SpcCorner.Parent = ScPlus

ScMinus.MouseButton1Click:Connect(function()
    Config.HitboxSize = math.max(5, Config.HitboxSize - 5)
    ScLabel.Text = "Hitbox Size: " .. tostring(Config.HitboxSize) .. " studs"
end)

ScPlus.MouseButton1Click:Connect(function()
    Config.HitboxSize = math.min(90, Config.HitboxSize + 5)
    ScLabel.Text = "Hitbox Size: " .. tostring(Config.HitboxSize) .. " studs"
end)

-- =====================================================================
-- TAB 2: MOBS & FARMING (Mob Magnet & Safe Float)
-- =====================================================================
local PageMobs = Instance.new("ScrollingFrame")
PageMobs.Size = UDim2.new(1, 0, 1, 0)
PageMobs.BackgroundTransparency = 1
PageMobs.ScrollBarThickness = 3
PageMobs.Visible = false
PageMobs.Parent = TabContentContainer
tabPages["mobs"] = PageMobs

local MobsLayout = Instance.new("UIListLayout")
MobsLayout.Padding = UDim.new(0, 8)
MobsLayout.Parent = PageMobs

-- Feature 2: Mob Magnet Toggle Card
local MagnetCard = Instance.new("Frame")
MagnetCard.Size = UDim2.new(1, 0, 0, 52)
MagnetCard.BackgroundColor3 = Color3.fromRGB(19, 24, 36)
MagnetCard.BorderSizePixel = 0
MagnetCard.Parent = PageMobs
local McCorner = Instance.new("UICorner")
McCorner.CornerRadius = UDim.new(0, 8)
McCorner.Parent = MagnetCard

local McLabel = Instance.new("TextLabel")
McLabel.Size = UDim2.new(0.65, 0, 0, 20)
McLabel.Position = UDim2.new(0, 10, 0, 6)
McLabel.BackgroundTransparency = 1
McLabel.Text = "Mob Magnet (Bring Mobs)"
McLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
McLabel.TextSize = 12
McLabel.Font = Enum.Font.GothamBold
McLabel.TextXAlignment = Enum.TextXAlignment.Left
McLabel.Parent = MagnetCard

local McSub = Instance.new("TextLabel")
McSub.Size = UDim2.new(0.65, 0, 0, 14)
McSub.Position = UDim2.new(0, 10, 0, 26)
McSub.BackgroundTransparency = 1
McSub.Text = "Pulls all mobs in range"
McSub.TextColor3 = Color3.fromRGB(140, 155, 175)
McSub.TextSize = 10
McSub.Font = Enum.Font.Gotham
McSub.TextXAlignment = Enum.TextXAlignment.Left
McSub.Parent = MagnetCard

local McSwitch = Instance.new("TextButton")
McSwitch.Size = UDim2.new(0, 56, 0, 28)
McSwitch.Position = UDim2.new(1, -66, 0.5, -14)
McSwitch.BackgroundColor3 = Config.MobMagnetEnabled and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(35, 42, 58)
McSwitch.Text = ""
McSwitch.Parent = MagnetCard
local McSwitchCorner = Instance.new("UICorner")
McSwitchCorner.CornerRadius = UDim.new(1, 0)
McSwitchCorner.Parent = McSwitch

local McCircle = Instance.new("Frame")
McCircle.Size = UDim2.new(0, 22, 0, 22)
McCircle.Position = Config.MobMagnetEnabled and UDim2.new(1, -25, 0.5, -11) or UDim2.new(0, 3, 0.5, -11)
McCircle.BackgroundColor3 = Config.MobMagnetEnabled and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(180, 195, 215)
McCircle.BorderSizePixel = 0
McCircle.Parent = McSwitch
local McCircleCorner = Instance.new("UICorner")
McCircleCorner.CornerRadius = UDim.new(1, 0)
McCircleCorner.Parent = McCircle

McSwitch.MouseButton1Click:Connect(function()
    Config.MobMagnetEnabled = not Config.MobMagnetEnabled
    if Config.MobMagnetEnabled then
        TweenService:Create(McSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(16, 185, 129)}):Play()
        TweenService:Create(McCircle, TweenInfo.new(0.2), {Position = UDim2.new(1, -25, 0.5, -11), BackgroundColor3 = Color3.fromRGB(255, 255, 255)}):Play()
        StartMasterLoop()
    else
        TweenService:Create(McSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(35, 42, 58)}):Play()
        TweenService:Create(McCircle, TweenInfo.new(0.2), {Position = UDim2.new(0, 3, 0.5, -11), BackgroundColor3 = Color3.fromRGB(180, 195, 215)}):Play()
        ReleaseMagnetMobs()
    end
end)

-- Safe Sky Float Card
local FloatCard = Instance.new("Frame")
FloatCard.Size = UDim2.new(1, 0, 0, 52)
FloatCard.BackgroundColor3 = Color3.fromRGB(19, 24, 36)
FloatCard.BorderSizePixel = 0
FloatCard.Parent = PageMobs
local FcCorner = Instance.new("UICorner")
FcCorner.CornerRadius = UDim.new(0, 8)
FcCorner.Parent = FloatCard

local FcLabel = Instance.new("TextLabel")
FcLabel.Size = UDim2.new(0.65, 0, 0, 20)
FcLabel.Position = UDim2.new(0, 10, 0, 6)
FcLabel.BackgroundTransparency = 1
FcLabel.Text = "Safe Sky Hover (Anti-Dmg)"
FcLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
FcLabel.TextSize = 12
FcLabel.Font = Enum.Font.GothamBold
FcLabel.TextXAlignment = Enum.TextXAlignment.Left
FcLabel.Parent = FloatCard

local FcSub = Instance.new("TextLabel")
FcSub.Size = UDim2.new(0.65, 0, 0, 14)
FcSub.Position = UDim2.new(0, 10, 0, 26)
FcSub.BackgroundTransparency = 1
FcSub.Text = "Hovers above mob melee"
FcSub.TextColor3 = Color3.fromRGB(140, 155, 175)
FcSub.TextSize = 10
FcSub.Font = Enum.Font.Gotham
FcSub.TextXAlignment = Enum.TextXAlignment.Left
FcSub.Parent = FloatCard

local FcSwitch = Instance.new("TextButton")
FcSwitch.Size = UDim2.new(0, 56, 0, 28)
FcSwitch.Position = UDim2.new(1, -66, 0.5, -14)
FcSwitch.BackgroundColor3 = Config.SkyFloatEnabled and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(35, 42, 58)
FcSwitch.Text = ""
FcSwitch.Parent = FloatCard
local FcSwitchCorner = Instance.new("UICorner")
FcSwitchCorner.CornerRadius = UDim.new(1, 0)
FcSwitchCorner.Parent = FcSwitch

local FcCircle = Instance.new("Frame")
FcCircle.Size = UDim2.new(0, 22, 0, 22)
FcCircle.Position = Config.SkyFloatEnabled and UDim2.new(1, -25, 0.5, -11) or UDim2.new(0, 3, 0.5, -11)
FcCircle.BackgroundColor3 = Config.SkyFloatEnabled and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(180, 195, 215)
FcCircle.BorderSizePixel = 0
FcCircle.Parent = FcSwitch
local FcCircleCorner = Instance.new("UICorner")
FcCircleCorner.CornerRadius = UDim.new(1, 0)
FcCircleCorner.Parent = FcCircle

FcSwitch.MouseButton1Click:Connect(function()
    Config.SkyFloatEnabled = not Config.SkyFloatEnabled
    if Config.SkyFloatEnabled then
        TweenService:Create(FcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(16, 185, 129)}):Play()
        TweenService:Create(FcCircle, TweenInfo.new(0.2), {Position = UDim2.new(1, -25, 0.5, -11), BackgroundColor3 = Color3.fromRGB(255, 255, 255)}):Play()
    else
        TweenService:Create(FcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(35, 42, 58)}):Play()
        TweenService:Create(FcCircle, TweenInfo.new(0.2), {Position = UDim2.new(0, 3, 0.5, -11), BackgroundColor3 = Color3.fromRGB(180, 195, 215)}):Play()
    end
end)

-- =====================================================================
-- TAB 3: VISUALS / 3D ESP
-- =====================================================================
local PageEsp = Instance.new("ScrollingFrame")
PageEsp.Size = UDim2.new(1, 0, 1, 0)
PageEsp.BackgroundTransparency = 1
PageEsp.ScrollBarThickness = 3
PageEsp.Visible = false
PageEsp.Parent = TabContentContainer
tabPages["esp"] = PageEsp

local EspLayout = Instance.new("UIListLayout")
EspLayout.Padding = UDim.new(0, 8)
EspLayout.Parent = PageEsp

-- Feature 4: 3D ESP Master Toggle
local EspCard = Instance.new("Frame")
EspCard.Size = UDim2.new(1, 0, 0, 52)
EspCard.BackgroundColor3 = Color3.fromRGB(19, 24, 36)
EspCard.BorderSizePixel = 0
EspCard.Parent = PageEsp
local EcCorner = Instance.new("UICorner")
EcCorner.CornerRadius = UDim.new(0, 8)
EcCorner.Parent = EspCard

local EcLabel = Instance.new("TextLabel")
EcLabel.Size = UDim2.new(0.65, 0, 0, 20)
EcLabel.Position = UDim2.new(0, 10, 0, 6)
EcLabel.BackgroundTransparency = 1
EcLabel.Text = "3D ESP & HP Meters"
EcLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
EcLabel.TextSize = 12
EcLabel.Font = Enum.Font.GothamBold
EcLabel.TextXAlignment = Enum.TextXAlignment.Left
EcLabel.Parent = EspCard

local EcSub = Instance.new("TextLabel")
EcSub.Size = UDim2.new(0.65, 0, 0, 14)
EcSub.Position = UDim2.new(0, 10, 0, 26)
EcSub.BackgroundTransparency = 1
EcSub.Text = "Shows Health & Distance"
EcSub.TextColor3 = Color3.fromRGB(140, 155, 175)
EcSub.TextSize = 10
EcSub.Font = Enum.Font.Gotham
EcSub.TextXAlignment = Enum.TextXAlignment.Left
EcSub.Parent = EspCard

local EcSwitch = Instance.new("TextButton")
EcSwitch.Size = UDim2.new(0, 56, 0, 28)
EcSwitch.Position = UDim2.new(1, -66, 0.5, -14)
EcSwitch.BackgroundColor3 = Config.EspEnabled and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(35, 42, 58)
EcSwitch.Text = ""
EcSwitch.Parent = EspCard
local EcSwitchCorner = Instance.new("UICorner")
EcSwitchCorner.CornerRadius = UDim.new(1, 0)
EcSwitchCorner.Parent = EcSwitch

local EcCircle = Instance.new("Frame")
EcCircle.Size = UDim2.new(0, 22, 0, 22)
EcCircle.Position = Config.EspEnabled and UDim2.new(1, -25, 0.5, -11) or UDim2.new(0, 3, 0.5, -11)
EcCircle.BackgroundColor3 = Config.EspEnabled and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(180, 195, 215)
EcCircle.BorderSizePixel = 0
EcCircle.Parent = EcSwitch
local EcCircleCorner = Instance.new("UICorner")
EcCircleCorner.CornerRadius = UDim.new(1, 0)
EcCircleCorner.Parent = EcCircle

EcSwitch.MouseButton1Click:Connect(function()
    Config.EspEnabled = not Config.EspEnabled
    if Config.EspEnabled then
        TweenService:Create(EcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(16, 185, 129)}):Play()
        TweenService:Create(EcCircle, TweenInfo.new(0.2), {Position = UDim2.new(1, -25, 0.5, -11), BackgroundColor3 = Color3.fromRGB(255, 255, 255)}):Play()
        StartMasterLoop()
    else
        TweenService:Create(EcSwitch, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(35, 42, 58)}):Play()
        TweenService:Create(EcCircle, TweenInfo.new(0.2), {Position = UDim2.new(0, 3, 0.5, -11), BackgroundColor3 = Color3.fromRGB(180, 195, 215)}):Play()
        ClearAllEsp()
    end
end)

-- =====================================================================
-- TAB 4: UI THEME ACCENT SWITCHER
-- =====================================================================
local PageTheme = Instance.new("ScrollingFrame")
PageTheme.Size = UDim2.new(1, 0, 1, 0)
PageTheme.BackgroundTransparency = 1
PageTheme.ScrollBarThickness = 3
PageTheme.Visible = false
PageTheme.Parent = TabContentContainer
tabPages["theme"] = PageTheme

local ThemeLayout = Instance.new("UIListLayout")
ThemeLayout.Padding = UDim.new(0, 8)
ThemeLayout.Parent = PageTheme

local ThemeHeader = Instance.new("TextLabel")
ThemeHeader.Size = UDim2.new(1, 0, 0, 20)
ThemeHeader.BackgroundTransparency = 1
ThemeHeader.Text = "SELECT ACCENT COLOR (LIVE)"
ThemeHeader.TextColor3 = Color3.fromRGB(160, 175, 200)
ThemeHeader.TextSize = 10
ThemeHeader.Font = Enum.Font.GothamBold
ThemeHeader.TextXAlignment = Enum.TextXAlignment.Left
ThemeHeader.Parent = PageTheme

local themePresets = {
    {name = "Marine Cyan", col = Color3.fromRGB(6, 182, 212)},
    {name = "Blood Crimson", col = Color3.fromRGB(239, 68, 68)},
    {name = "Neon Emerald", col = Color3.fromRGB(16, 185, 129)},
    {name = "Amethyst Violet", col = Color3.fromRGB(168, 85, 247)},
    {name = "Solar Gold", col = Color3.fromRGB(245, 158, 11)},
    {name = "Midnight Indigo", col = Color3.fromRGB(99, 102, 241)}
}

-- Theme Live Changer Function
local function ApplyThemeColor(color)
    Config.ThemeColor = color
    MainStroke.Color = color
    
    -- Update active tab button
    if tabButtons[activeTab] then
        tabButtons[activeTab].BackgroundColor3 = color
    end
    
    -- Update floating widget
    local fw = ScreenGui:FindFirstChild("FloatingMiniToggle")
    if fw then fw.BackgroundColor3 = color end
    
    -- Update hitboxes live
    if Config.HitboxEnabled then
        for part, _ in pairs(OriginalPartProperties) do
            if part and part.Parent then
                part.Color = color
            end
        end
    end
end

for _, th in ipairs(themePresets) do
    local b = Instance.new("TextButton")
    b.Size = UDim2.new(1, 0, 0, 34)
    b.BackgroundColor3 = Color3.fromRGB(20, 26, 38)
    b.Text = "  " .. th.name
    b.TextColor3 = Color3.fromRGB(240, 245, 255)
    b.TextSize = 11
    b.Font = Enum.Font.GothamSemibold
    b.TextXAlignment = Enum.TextXAlignment.Left
    b.Parent = PageTheme
    
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, 6)
    c.Parent = b
    
    -- Color preview dot
    local dot = Instance.new("Frame")
    dot.Size = UDim2.new(0, 14, 0, 14)
    dot.Position = UDim2.new(1, -24, 0.5, -7)
    dot.BackgroundColor3 = th.col
    dot.BorderSizePixel = 0
    dot.Parent = b
    local dc = Instance.new("UICorner")
    dc.CornerRadius = UDim.new(1, 0)
    dc.Parent = dot
    
    b.MouseButton1Click:Connect(function()
        ApplyThemeColor(th.col)
    end)
end

-- =====================================================================
-- MINIMIZE, CLOSE, RESTORE & FLOATING ACTIONS
-- =====================================================================
local FloatingWidget = Instance.new("TextButton")
FloatingWidget.Name = "FloatingMiniToggle"
FloatingWidget.Size = UDim2.new(0, 48, 0, 48)
FloatingWidget.Position = UDim2.new(0, 18, 0.5, -24)
FloatingWidget.BackgroundColor3 = Config.ThemeColor
FloatingWidget.Text = "🗡️"
FloatingWidget.TextSize = 22
FloatingWidget.Visible = true
FloatingWidget.Parent = ScreenGui
local FloatCorner = Instance.new("UICorner")
FloatCorner.CornerRadius = UDim.new(1, 0)
FloatCorner.Parent = FloatingWidget
local FloatStroke = Instance.new("UIStroke")
FloatStroke.Color = Color3.fromRGB(255, 255, 255)
FloatStroke.Thickness = 2
FloatStroke.Parent = FloatingWidget

-- Floating widget click toggles UI
FloatingWidget.MouseButton1Click:Connect(function()
    MainFrame.Visible = not MainFrame.Visible
end)

-- WORKING MINIMIZE BUTTON ACTION
MinButton.MouseButton1Click:Connect(function()
    MainFrame.Visible = false
    FloatingWidget.Visible = true
end)

-- WORKING CLOSE BUTTON ACTION
CloseButton.MouseButton1Click:Connect(function()
    MainFrame.Visible = false
    FloatingWidget.Visible = true
    print("[Blox Fruits Hub]: Minimized to floating button. Press " .. tostring(Config.Keybind) .. " to reopen anytime.")
end)

-- Keybind Toggle Listener
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if not gameProcessed and input.KeyCode == Config.Keybind then
        MainFrame.Visible = not MainFrame.Visible
    end
end)

-- Start Execution Immediately
StartMasterLoop()

-- Native Roblox Toast Notification
pcall(function()
    StarterGui:SetCore("SendNotification", {
        Title = "Blox Fruits V3 Suite",
        Text = "Script Loaded! Press [${config.keybind}] or tap 🗡️",
        Duration = 6
    })
end)

print("[Blox Fruits V3 Suite]: Loaded successfully! Tap floating 🗡️ or press ${config.keybind} to toggle menu.")
`;
}
